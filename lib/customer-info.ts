/**
 * localStorage helpers for the customer info attached to each WhatsApp order:
 * shipping type + the fields that type requires. Persisted across sessions so
 * repeat customers don't have to retype.
 *
 * v2 expanded the v1 shape (which only stored name+zone) with shippingType
 * + per-type address fields. Old v1 payloads are dropped silently — there are
 * no production users yet.
 */

const STORAGE_KEY = 'amantis.customer';
const STORAGE_VERSION = 2;
const MAX_LEN = 120;
const MAX_NOTE_LEN = 280;

export type ShippingType = 'pickup' | 'mandaditos' | 'national';

export const SHIPPING_LABELS: Record<ShippingType, string> = {
  pickup: 'Pasar a recoger (Cd. del Carmen)',
  mandaditos: 'Mandaditos local (Cd. del Carmen)',
  national: 'Envío a otra ciudad',
};

/** Shipping cost in MXN (null = "by confirmation"). */
export const SHIPPING_COSTS: Record<ShippingType, number | null> = {
  pickup: 0,
  mandaditos: 45,
  national: null,
};

export type CustomerInfo = {
  shippingType: ShippingType | null;
  name: string;
  phone: string;
  /** Local-only: free-form street/number/colonia/refs. */
  localAddress: string;
  /** Local-only: optional separate references field. */
  localNotes: string;
  /** National-only fields. */
  city: string;
  state: string;
  street: string;
  neighborhood: string;
  zip: string;
};

export const EMPTY_CUSTOMER: CustomerInfo = {
  shippingType: null,
  name: '',
  phone: '',
  localAddress: '',
  localNotes: '',
  city: '',
  state: '',
  street: '',
  neighborhood: '',
  zip: '',
};

function clip(value: unknown, max: number = MAX_LEN): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function parseShippingType(value: unknown): ShippingType | null {
  return value === 'pickup' || value === 'mandaditos' || value === 'national'
    ? value
    : null;
}

export function getCustomerInfo(): CustomerInfo {
  if (typeof window === 'undefined') return EMPTY_CUSTOMER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CUSTOMER;
    const parsed = JSON.parse(raw) as { v?: number } & Partial<CustomerInfo>;
    if (parsed.v !== STORAGE_VERSION) return EMPTY_CUSTOMER;
    return {
      shippingType: parseShippingType(parsed.shippingType),
      name: clip(parsed.name),
      phone: clip(parsed.phone, 30),
      localAddress: clip(parsed.localAddress),
      localNotes: clip(parsed.localNotes, MAX_NOTE_LEN),
      city: clip(parsed.city),
      state: clip(parsed.state),
      street: clip(parsed.street),
      neighborhood: clip(parsed.neighborhood),
      zip: clip(parsed.zip, 10),
    };
  } catch {
    return EMPTY_CUSTOMER;
  }
}

export function setCustomerInfo(info: CustomerInfo): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      v: STORAGE_VERSION,
      shippingType: info.shippingType,
      name: clip(info.name),
      phone: clip(info.phone, 30),
      localAddress: clip(info.localAddress),
      localNotes: clip(info.localNotes, MAX_NOTE_LEN),
      city: clip(info.city),
      state: clip(info.state),
      street: clip(info.street),
      neighborhood: clip(info.neighborhood),
      zip: clip(info.zip, 10),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private mode — best-effort.
  }
}

/**
 * Required-field check per shipping type. Used to gate the "Enviar pedido"
 * button and to flag which inputs are missing.
 */
export function getMissingFields(info: CustomerInfo): string[] {
  const missing: string[] = [];
  if (!info.shippingType) {
    missing.push('shippingType');
    return missing;
  }
  if (!info.name.trim()) missing.push('name');
  if (!info.phone.trim()) missing.push('phone');
  if (info.shippingType === 'mandaditos' && !info.localAddress.trim()) {
    missing.push('localAddress');
  }
  if (info.shippingType === 'national') {
    if (!info.city.trim()) missing.push('city');
    if (!info.state.trim()) missing.push('state');
    if (!info.street.trim()) missing.push('street');
    if (!info.neighborhood.trim()) missing.push('neighborhood');
    if (!info.zip.trim()) missing.push('zip');
  }
  return missing;
}
