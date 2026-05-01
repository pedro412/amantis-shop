import type { CartItem } from '@/components/public/cart-context';
import {
  SHIPPING_COSTS,
  SHIPPING_LABELS,
  type CustomerInfo,
} from '@/lib/customer-info';
import { formatMXN } from '@/lib/format';

const MSI_THRESHOLD = 1500;

/**
 * Build the pre-filled WhatsApp message for the whole cart. Plain text so it
 * renders well across iOS/Android WhatsApp without surprises.
 */
export function buildOrderMessage(
  items: CartItem[],
  customer?: Partial<CustomerInfo>,
): string {
  if (items.length === 0) return '';

  const lines = items.map((item) => {
    const variantSuffix = item.variantLabel ? ` (variante: ${item.variantLabel})` : '';
    const lineTotal = item.unitPrice * item.qty;
    return `• ${item.qty}× ${item.name}${variantSuffix} — ${formatMXN(lineTotal)}`;
  });

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);

  const out: string[] = [
    'Hola Ámantis, me gustaría hacer este pedido:',
    '',
    ...lines,
    '',
    `Subtotal: ${formatMXN(subtotal)} MXN`,
  ];

  // Shipping block — added only when the customer chose a type so the
  // message stays clean if they're sharing a draft cart link or similar.
  if (customer?.shippingType) {
    const cost = SHIPPING_COSTS[customer.shippingType];
    const label = SHIPPING_LABELS[customer.shippingType];
    if (cost === null) {
      out.push(`Envío: ${label} — costo a confirmar`);
      out.push(`*Total estimado (sin envío): ${formatMXN(subtotal)} MXN*`);
    } else if (cost === 0) {
      out.push(`Envío: ${label} — sin costo`);
      out.push(`*Total: ${formatMXN(subtotal)} MXN*`);
    } else {
      out.push(`Envío: ${label} — ${formatMXN(cost)}`);
      out.push(`*Total: ${formatMXN(subtotal + cost)} MXN*`);
    }
  } else {
    out.push('*Costo de envío a confirmar*');
  }

  if (subtotal >= MSI_THRESHOLD) {
    out.push('*Aplica 3 meses sin intereses con tarjeta de crédito participante*');
  }

  // Customer details block — only the fields that match the chosen type.
  const detailLines: string[] = [];
  const name = customer?.name?.trim();
  const phone = customer?.phone?.trim();
  if (name) detailLines.push(`Nombre: ${name}`);
  if (phone) detailLines.push(`Teléfono: ${phone}`);

  if (customer?.shippingType === 'mandaditos') {
    const addr = customer.localAddress?.trim();
    const notes = customer.localNotes?.trim();
    if (addr) detailLines.push(`Dirección: ${addr}`);
    if (notes) detailLines.push(`Referencias: ${notes}`);
  }
  if (customer?.shippingType === 'national') {
    const street = customer.street?.trim();
    const neighborhood = customer.neighborhood?.trim();
    const city = customer.city?.trim();
    const state = customer.state?.trim();
    const zip = customer.zip?.trim();
    if (street) detailLines.push(`Calle y número: ${street}`);
    if (neighborhood) detailLines.push(`Colonia: ${neighborhood}`);
    if (city || state) {
      detailLines.push(`Ciudad: ${[city, state].filter(Boolean).join(', ')}`);
    }
    if (zip) detailLines.push(`CP: ${zip}`);
  }

  if (detailLines.length > 0) {
    out.push('');
    out.push('Datos:');
    out.push(...detailLines);
  }

  return out.join('\n');
}
