import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Pill badge for product/admin states. Variants per design handoff:
 *  - default: muted (fallback)
 *  - new:     crimson fill (highlight a new item)
 *  - sale:    near-black fill (promo)
 *  - soft:    primary-soft pill with crimson text
 *  - low:     amber on cream (low stock)
 *  - out:     muted (out of stock)
 */
const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full px-2.5',
    'h-[22px] font-sans text-[10px] font-semibold uppercase tracking-[0.14em]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-surface-alt text-fg-muted',
        new: 'bg-primary text-primary-foreground',
        sale: 'bg-fg text-fg-inverse',
        soft: 'bg-primary-soft text-primary',
        low: 'bg-[#FBEED9] text-warning',
        out: 'bg-surface-alt text-fg-subtle',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
