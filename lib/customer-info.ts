/**
 * Tiny localStorage helpers for the optional customer info that ships with
 * each WhatsApp order (name + zone). Persisted across sessions so repeat
 * customers don't have to retype.
 */

const STORAGE_KEY = 'amantis.customer';
const STORAGE_VERSION = 1;
const MAX_LEN = 80;

export type CustomerInfo = {
  name: string;
  zone: string;
};

type Persisted = {
  v: typeof STORAGE_VERSION;
  name?: string;
  zone?: string;
};

export const EMPTY_CUSTOMER: CustomerInfo = { name: '', zone: '' };

export function getCustomerInfo(): CustomerInfo {
  if (typeof window === 'undefined') return EMPTY_CUSTOMER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CUSTOMER;
    const parsed = JSON.parse(raw) as Persisted | unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'v' in parsed &&
      (parsed as Persisted).v === STORAGE_VERSION
    ) {
      const p = parsed as Persisted;
      return {
        name: typeof p.name === 'string' ? p.name.slice(0, MAX_LEN) : '',
        zone: typeof p.zone === 'string' ? p.zone.slice(0, MAX_LEN) : '',
      };
    }
  } catch {
    // Corrupted payload — drop silently.
  }
  return EMPTY_CUSTOMER;
}

export function setCustomerInfo(info: CustomerInfo): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: Persisted = {
      v: STORAGE_VERSION,
      name: info.name.slice(0, MAX_LEN),
      zone: info.zone.slice(0, MAX_LEN),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private mode — best-effort.
  }
}
