'use client';

import { useCart } from '@/components/public/cart-context';
import { Button } from '@/components/ui/button';
import { encodeCartState } from '@/lib/cart-link';
import { SHIPPING_COSTS, getMissingFields } from '@/lib/customer-info';
import { formatMXN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { buildOrderMessage } from '@/lib/whatsapp-cart';
import { buildWhatsappUrl } from '@/lib/whatsapp';

import { useCustomerInfo } from './customer-info-context';
import { MSI_THRESHOLD, MsiHint } from './msi-progress';

/**
 * Maps a missing-field key (from `getMissingFields`) to the DOM id of the
 * corresponding input/control in `cart-customer-fields.tsx`. Used by the
 * primary CTA to scroll + focus the first thing the user is missing instead
 * of rendering as a dead "disabled" button.
 */
const FIELD_IDS: Partial<Record<string, string>> = {
  shippingType: 'customer-shipping-type',
  name: 'customer-name',
  phone: 'customer-phone',
  localAddress: 'customer-local-address',
  city: 'customer-city',
  state: 'customer-state',
  street: 'customer-street',
  neighborhood: 'customer-neighborhood',
  zip: 'customer-zip',
};

function focusFirstMissing(missing: string[]): void {
  if (typeof document === 'undefined' || missing.length === 0) return;
  const id = FIELD_IDS[missing[0]!];
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Wait for the smooth scroll to settle before pulling focus — focus()
  // jumps the page in some browsers and would cancel the smooth scroll.
  window.setTimeout(() => el.focus({ preventScroll: true }), 320);
}

export function CartSummary() {
  const { items } = useCart();
  const { info } = useCustomerInfo();

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
  const shippingCost = info.shippingType ? SHIPPING_COSTS[info.shippingType] : null;
  const total = shippingCost === null ? subtotal : subtotal + shippingCost;
  const missing = getMissingFields(info);
  const canSend = items.length > 0 && missing.length === 0;

  // Build a deep link to the reconstructed cart so the operator can open it
  // from WhatsApp and see the full detail. CartSummary only renders after the
  // cart is hydrated client-side, so `window.location.origin` is safe here.
  const cartLink = (() => {
    if (items.length === 0) return undefined;
    const encoded = encodeCartState(items, info);
    if (!encoded.ok) return undefined;
    if (typeof window === 'undefined') return undefined;
    return `${window.location.origin}/carrito/c/${encoded.encoded}`;
  })();

  const message = buildOrderMessage(items, info, cartLink);
  const href = buildWhatsappUrl(message);

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-30 border-t border-border/60 bg-bg/85 backdrop-blur-sm',
        'supports-[backdrop-filter]:bg-bg/70',
        // Sit just above the fixed bottom nav (h-14 + iOS safe inset).
        'bottom-[calc(3.5rem+env(safe-area-inset-bottom))]',
      )}
    >
      <div className="space-y-2 px-5 pb-3 pt-3">
        <MsiHint subtotal={subtotal} />

        <dl className="flex items-baseline justify-between font-sans text-[12px] text-fg-muted">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatMXN(subtotal)}</dd>
        </dl>
        <dl className="flex items-baseline justify-between font-sans text-[12px] text-fg-muted">
          <dt>Envío</dt>
          <dd className={cn('tabular-nums', shippingCost === 0 && 'text-fg')}>
            {info.shippingType
              ? shippingCost === null
                ? 'Por confirmar'
                : shippingCost === 0
                  ? 'Sin costo'
                  : formatMXN(shippingCost)
              : 'Selecciona tipo de envío'}
          </dd>
        </dl>
        <dl className="flex items-baseline justify-between border-t border-border/60 pt-2">
          <dt className="font-sans text-[13px] font-medium text-fg">
            {shippingCost === null ? 'Total estimado' : 'Total'}
          </dt>
          <dd className="font-serif text-[22px] font-semibold tabular-nums text-primary">
            {formatMXN(total)}
          </dd>
        </dl>

        <Button
          asChild={canSend}
          size="md"
          variant="primary"
          // aria-disabled (not the HTML disabled attr) so the click handler
          // can still fire and we can scroll/focus the user to the first
          // missing field instead of doing nothing.
          aria-disabled={!canSend}
          className={cn('mt-1 w-full', !canSend && 'opacity-60')}
          onClick={
            canSend
              ? undefined
              : (e) => {
                  e.preventDefault();
                  focusFirstMissing(missing);
                }
          }
        >
          {canSend ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              Enviar pedido por WhatsApp
            </a>
          ) : (
            <span>
              {items.length === 0
                ? 'Agrega productos al carrito'
                : !info.shippingType
                  ? 'Elige tipo de envío'
                  : 'Completa tus datos'}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export { MSI_THRESHOLD };
