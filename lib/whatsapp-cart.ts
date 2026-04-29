import type { CartItem } from '@/components/public/cart-context';
import { formatMXN } from '@/lib/format';

/**
 * Build the pre-filled WhatsApp message for the whole cart. Plain text so it
 * renders well across iOS/Android WhatsApp without surprises.
 */
export function buildOrderMessage(items: CartItem[]): string {
  if (items.length === 0) return '';

  const lines = items.map((item) => {
    const variantSuffix = item.variantLabel ? ` (variante: ${item.variantLabel})` : '';
    const lineTotal = item.unitPrice * item.qty;
    return `• ${item.qty}× ${item.name}${variantSuffix} — ${formatMXN(lineTotal)}`;
  });

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);

  return [
    'Hola Shirley, me gustaría hacer este pedido:',
    '',
    ...lines,
    '',
    `Total estimado: ${formatMXN(subtotal)} MXN`,
  ].join('\n');
}
