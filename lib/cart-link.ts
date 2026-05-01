/**
 * Encode/decode helpers for sharing a cart via URL. The full state (items +
 * shipping selection + buyer fields) is JSON-stringified, base64url-encoded,
 * and stuffed into the `state` query param of /carrito.
 *
 * Why URL encoding (vs server-side share IDs)? No DB writes, no auth, the link
 * stays valid forever, and Shirley can paste it back to the customer just like
 * any other URL. Tradeoff: long carts produce long URLs; we cap payload size.
 */

import type { CartItem } from '@/components/public/cart-context';
import type { CustomerInfo } from '@/lib/customer-info';

const VERSION = 1;
const MAX_ITEMS = 30;
const MAX_ENCODED_BYTES = 4096;

type SharedCart = {
  v: typeof VERSION;
  items: CartItem[];
  customer: Partial<CustomerInfo>;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 =
    typeof btoa !== 'undefined'
      ? btoa(binary)
      : Buffer.from(binary, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array | null {
  try {
    const padded = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4;
    const b64 = pad ? padded + '='.repeat(4 - pad) : padded;
    const binary =
      typeof atob !== 'undefined'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export type EncodeResult =
  | { ok: true; encoded: string }
  | { ok: false; reason: 'too_many_items' | 'too_large' };

export function encodeCartState(
  items: CartItem[],
  customer: Partial<CustomerInfo>,
): EncodeResult {
  if (items.length > MAX_ITEMS) {
    return { ok: false, reason: 'too_many_items' };
  }
  const payload: SharedCart = { v: VERSION, items, customer };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const encoded = toBase64Url(bytes);
  if (encoded.length > MAX_ENCODED_BYTES) {
    return { ok: false, reason: 'too_large' };
  }
  return { ok: true, encoded };
}

export type DecodedCartState = {
  items: CartItem[];
  customer: Partial<CustomerInfo>;
};

export function decodeCartState(state: string): DecodedCartState | null {
  const bytes = fromBase64Url(state);
  if (!bytes) return null;
  try {
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as SharedCart;
    if (parsed.v !== VERSION || !Array.isArray(parsed.items)) return null;
    // Light sanitization: trust only the keys we know about.
    const items: CartItem[] = parsed.items
      .filter(
        (i): i is CartItem =>
          !!i &&
          typeof i.lineId === 'string' &&
          typeof i.productId === 'string' &&
          typeof i.slug === 'string' &&
          typeof i.name === 'string' &&
          typeof i.unitPrice === 'number' &&
          typeof i.qty === 'number',
      )
      .slice(0, MAX_ITEMS);
    const customer =
      parsed.customer && typeof parsed.customer === 'object'
        ? parsed.customer
        : {};
    return { items, customer };
  } catch {
    return null;
  }
}
