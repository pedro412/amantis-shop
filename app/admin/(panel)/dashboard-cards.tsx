import { AlertTriangle, FolderX, ImageOff, Package } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'warning' | 'muted' | 'destructive';

type Card = {
  href: string;
  label: string;
  count: number;
  Icon: typeof Package;
  tone: Tone;
};

type Props = {
  activeCount: number;
  lowStockCount: number;
  noImageCount: number;
  orphanCategoryCount: number;
};

export function DashboardCards({
  activeCount,
  lowStockCount,
  noImageCount,
  orphanCategoryCount,
}: Props) {
  const cards: Card[] = [
    {
      href: '/admin/productos?tab=activos',
      label: 'Productos activos',
      count: activeCount,
      Icon: Package,
      tone: 'neutral',
    },
    {
      href: '/admin/productos?lowStock=1',
      label: 'Stock bajo',
      count: lowStockCount,
      Icon: AlertTriangle,
      tone: 'warning',
    },
    {
      href: '/admin/productos?noImage=1',
      label: 'Sin imagen',
      count: noImageCount,
      Icon: ImageOff,
      tone: 'muted',
    },
    {
      href: '/admin/productos?orphanCategory=1',
      label: 'Categoría eliminada',
      count: orphanCategoryCount,
      Icon: FolderX,
      tone: 'destructive',
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <li key={c.label}>
          <DashboardCard card={c} />
        </li>
      ))}
    </ul>
  );
}

function DashboardCard({ card }: { card: Card }) {
  const { href, label, count, Icon, tone } = card;
  return (
    <Link
      href={href}
      className={cn(
        'flex h-full flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-4',
        'transition-colors duration-base ease-smooth hover:border-border-strong',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md',
            toneIconClass(tone),
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span
          className={cn(
            'font-serif text-[28px] font-medium leading-none tabular-nums',
            toneCountClass(tone, count),
          )}
        >
          {count}
        </span>
      </div>
      <p className="font-sans text-[12px] font-medium leading-tight text-fg-muted">
        {label}
      </p>
    </Link>
  );
}

function toneIconClass(tone: Tone): string {
  switch (tone) {
    case 'warning':
      return 'bg-warning/10 text-warning';
    case 'destructive':
      return 'bg-destructive/10 text-destructive';
    case 'muted':
      return 'bg-surface-alt text-fg-muted';
    case 'neutral':
    default:
      return 'bg-primary-soft text-primary';
  }
}

function toneCountClass(tone: Tone, count: number): string {
  // Zero-count cards stay in neutral fg so the dashboard isn't visually shouty
  // when there's nothing to act on (a "0" on Stock bajo is good news, not a
  // warning).
  if (count === 0) return 'text-fg';
  switch (tone) {
    case 'warning':
      return 'text-warning';
    case 'destructive':
      return 'text-destructive';
    case 'muted':
    case 'neutral':
    default:
      return 'text-fg';
  }
}
