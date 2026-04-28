'use client';

import { ArrowUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId } from 'react';

import { cn } from '@/lib/utils';
import { type SortOrder, isSortOrder } from '@/server/queries/listing';

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'nuevo', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = useId();

  const raw = searchParams.get('orden');
  const current: SortOrder = isSortOrder(raw) ? raw : 'nuevo';
  const currentLabel = OPTIONS.find((o) => o.value === current)?.label ?? 'Más recientes';

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'nuevo') params.delete('orden');
    else params.set('orden', value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        'relative inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-bg pl-4 pr-3',
        'font-sans text-[13px] font-medium text-fg-muted',
        'transition-colors hover:border-border-strong hover:text-fg',
        'focus-within:border-primary focus-within:text-primary',
      )}
    >
      <ArrowUpDown aria-hidden className="h-4 w-4" strokeWidth={1.75} />
      <label htmlFor={id} className="sr-only">
        Ordenar
      </label>
      <span className="pointer-events-none">{currentLabel}</span>
      <select
        id={id}
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none rounded-full bg-transparent opacity-0"
        aria-label="Ordenar productos"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
