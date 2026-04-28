import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type Props = {
  name: string;
  parentName: string | null;
  totalCount: number;
};

export function ListingHeader({ name, parentName, totalCount }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 pt-2 pb-3">
      <Link
        href="/"
        aria-label="Volver al inicio"
        className="-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.75} />
      </Link>
      <div className="min-w-0 flex-1">
        {parentName && (
          <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
            {parentName}
          </p>
        )}
        <h1 className="truncate font-serif text-[20px] font-medium leading-tight text-fg">
          {name}
        </h1>
      </div>
      <p className="font-sans text-[12px] tabular-nums text-fg-muted">
        {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
      </p>
    </div>
  );
}
