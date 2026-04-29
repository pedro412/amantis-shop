'use client';

import { useCart } from '@/components/public/cart-context';
import { Button } from '@/components/ui/button';
import { formatMXN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { buildOrderMessage } from '@/lib/whatsapp-cart';
import { buildWhatsappUrl } from '@/lib/whatsapp';

import { useCustomerInfo } from './customer-info-context';

export function CartSummary() {
  const { items } = useCart();
  const { info } = useCustomerInfo();

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
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
      <div className="px-5 pb-3 pt-4">
        <dl className="flex items-baseline justify-between font-sans text-[12px] text-fg-muted">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatMXN(subtotal)}</dd>
        </dl>
        <dl className="mt-1 flex items-baseline justify-between font-sans text-[12px] text-fg-muted">
          <dt>Envío</dt>
          <dd>Por confirmar</dd>
        </dl>
        <dl className="mt-2.5 flex items-baseline justify-between border-t border-border/60 pt-2.5">
          <dt className="font-sans text-[13px] font-medium text-fg">
            Total estimado
          </dt>
          <dd className="font-serif text-[22px] font-semibold tabular-nums text-primary">
            {formatMXN(subtotal)}
          </dd>
        </dl>

        <Button
          asChild
          size="lg"
          variant="primary"
          className="mt-3 w-full"
        >
          <a href={href} target="_blank" rel="noopener noreferrer">
            Enviar pedido por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
