import { Sparkles } from 'lucide-react';

import { formatMXN } from '@/lib/format';
import { cn } from '@/lib/utils';

export const MSI_THRESHOLD = 1500;

type Props = {
  subtotal: number;
};

/**
 * Visualizes the customer's progress toward the 3-MSI threshold. Below the
 * threshold shows a progress bar with how much is missing; at or above shows
 * a "qualifies" badge. Confirmed copy with Shirley: "tarjeta de crédito
 * participante" (no specific bank).
 */
export function MsiHint({ subtotal }: Props) {
  if (subtotal <= 0) return null;
  const qualifies = subtotal >= MSI_THRESHOLD;
  const remaining = Math.max(0, MSI_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / MSI_THRESHOLD) * 100);

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5',
        qualifies
          ? 'border-primary/40 bg-primary-soft'
          : 'border-border bg-surface-alt/60',
      )}
    >
      <div className="flex items-start gap-2">
        <Sparkles
          aria-hidden
          className={cn('mt-0.5 h-4 w-4 shrink-0', qualifies ? 'text-primary' : 'text-fg-muted')}
          strokeWidth={1.75}
        />
        <p
          className={cn(
            'font-sans text-[12px] leading-snug',
            qualifies ? 'font-medium text-primary' : 'text-fg-muted',
          )}
        >
          {qualifies ? (
            <>Califica para <strong>3 meses sin intereses</strong> con tarjeta de crédito participante.</>
          ) : (
            <>
              Te faltan <strong className="tabular-nums">{formatMXN(remaining)}</strong> para 3 meses sin intereses con tarjeta de crédito participante.
            </>
          )}
        </p>
      </div>
      {!qualifies && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-base ease-smooth"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
