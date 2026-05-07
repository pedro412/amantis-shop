/**
 * Field-level validators used to drive the green/red feedback in the public
 * inputs (cart, auth). Pure boolean helpers — keep regex tolerant for casual
 * Mexican input formats (phone with spaces/dashes, etc.) so the user gets
 * green feedback without having to format perfectly.
 */

export function isNameValid(v: string): boolean {
  return v.trim().length >= 2;
}

export function isPhoneValid(v: string): boolean {
  // 10 digits, ignoring spaces / dashes / parens / leading +52 country code.
  const digits = v.replace(/\D/g, '');
  if (digits.length === 10) return true;
  if (digits.length === 12 && digits.startsWith('52')) return true;
  return false;
}

/** street + neighborhood + localAddress — anything address-shaped. */
export function isAddressValid(v: string): boolean {
  return v.trim().length >= 5;
}

/** city / state — short text. */
export function isShortFieldValid(v: string): boolean {
  return v.trim().length >= 2;
}

export function isZipValid(v: string): boolean {
  return /^\d{5}$/.test(v.trim());
}

export function isEmailValid(v: string): boolean {
  // Light regex — server side does the strict check. We only want to know if
  // the shape is plausible enough to flip the input green.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isPasswordValid(v: string): boolean {
  return v.length >= 6;
}
