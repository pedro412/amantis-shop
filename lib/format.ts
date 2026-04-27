/**
 * Currency formatter for the storefront's primary market (MXN). Centralised
 * so we change the locale or symbol in exactly one place if we ever expand.
 */
const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMXN(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return MXN.format(n);
}
