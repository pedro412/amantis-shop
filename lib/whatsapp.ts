/**
 * WhatsApp deep-link helpers. The catalog never charges payments — every
 * conversion path lands on Shirley's WhatsApp with a pre-filled message.
 *
 * Number is read from `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only, country
 * code included, no `+`). Until production is configured, falls back to a
 * placeholder so dev pages still render — surfaces a console warning so the
 * missing env var gets noticed before launch.
 */

const PLACEHOLDER_NUMBER = '5210000000000';
let warned = false;

export function getWhatsappNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  if (fromEnv && fromEnv.length >= 10) return fromEnv;
  if (typeof window !== 'undefined' && !warned) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[whatsapp] NEXT_PUBLIC_WHATSAPP_NUMBER is not set; using placeholder. Set it before launch.',
    );
  }
  return PLACEHOLDER_NUMBER;
}

export function buildWhatsappUrl(message?: string): string {
  const number = getWhatsappNumber();
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
