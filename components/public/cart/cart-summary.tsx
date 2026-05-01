'use client';

import { useCart } from '@/components/public/cart-context';
import { Button } from '@/components/ui/button';
import { SHIPPING_COSTS, getMissingFields } from '@/lib/customer-info';
import { formatMXN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { buildOrderMessage } from '@/lib/whatsapp-cart';
import { buildWhatsappUrl } from '@/lib/whatsapp';

import { useCustomerInfo } from './customer-info-context';
import { MSI_THRESHOLD, MsiHint } from './msi-progress';

export function CartSummary() {
  const { items } = useCart();
  const { info } = useCustomerInfo();

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
  const shippingCost = info.shippingType ? SHIPPING_COSTS[info.shippingType] : null;
  const total = shippingCost === null ? subtotal : subtotal + shippingCost;
  const missing = getMissingFields(info);
  const canSend = items.length > 0 && missing.length === 0;
  const message = buildOrderMessage(items, info);
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
          className="mt-1 w-full"
          disabled={!canSend}
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
