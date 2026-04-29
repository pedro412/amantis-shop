/**
 * WhatsApp deep-link helpers. The catalog never charges payments — every
 * conversion path lands on Shirley's WhatsApp with a pre-filled message.
 *
 * Number is read from `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only, country
 * code included, no `+`). Falls back to Shirley's real number so dev / preview
 * deploys behave identically without env wiring.
 */

const DEFAULT_NUMBER = '529381830251';

export function getWhatsappNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  if (fromEnv && fromEnv.length >= 10) return fromEnv;
  return DEFAULT_NUMBER;
}

export function getWhatsappDisplayNumber(): string {
  // 529381830251 -> +52 938 183 0251 (MX 10-digit national format).
  const number = getWhatsappNumber();
  if (number.length === 12 && number.startsWith('52')) {
    const local = number.slice(2);
    return `+52 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return `+${number}`;
}

export function buildWhatsappUrl(message?: string): string {
  const number = getWhatsappNumber();
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
