'use client';

import { Filter, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type TabValue = 'todos' | 'activos' | 'borradores' | 'agotados';

type TabDef = { value: TabValue; label: string; count: number };

type CategoryOption = { id: string; name: string };

type Props = {
  tabs: TabDef[];
  categories: CategoryOption[];
};

const SEARCH_DEBOUNCE_MS = 200;

export function ProductosFilters({ tabs, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get('tab') ?? 'todos') as TabValue;
  const currentQ = searchParams.get('q') ?? '';
  const currentCategoryId = searchParams.get('categoryId') ?? '';
  const currentLowStock = searchParams.get('lowStock') === '1';
  const currentNoImage = searchParams.get('noImage') === '1';

  const [q, setQ] = useState(currentQ);

  // When the user clears via filters elsewhere (e.g. tab change resetting),
  // keep our local input mirror in sync with the URL.
  const lastUrlQ = useRef(currentQ);
  useEffect(() => {
    if (currentQ !== lastUrlQ.current && currentQ !== q) {
      setQ(currentQ);
    }
    lastUrlQ.current = currentQ;
  }, [currentQ, q]);

  // Debounce push to URL.
  useEffect(() => {
    if (q === currentQ) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set('q', q);
      else params.delete('q');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFilterCount =
    (currentCategoryId ? 1 : 0) + (currentLowStock ? 1 : 0) + (currentNoImage ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
            strokeWidth={1.75}
          />
          <Input
            type="search"
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 pr-10"
          />
          {q && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-fg-subtle hover:bg-surface-alt hover:text-fg-muted"
            >
              <X aria-hidden className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Filtros"
              className={cn(
                'relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-bg text-fg-muted',
                'transition-colors hover:border-border-strong',
                activeFilterCount > 0 ? 'border-primary text-primary' : 'border-border',
              )}
            >
              <Filter aria-hidden className="h-4 w-4" strokeWidth={1.75} />
              {activeFilterCount > 0 && (
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 font-sans text-[10px] font-medium text-primary-foreground"
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="rounded-t-xl bg-surface p-5 pt-6"
          >
            <SheetTitle className="font-serif text-h3 font-medium">Filtros</SheetTitle>
            <SheetDescription>
              Refina la lista por categoría o estado de inventario.
            </SheetDescription>

            <div className="mt-5 flex flex-col gap-5">
              <div>
                <Label htmlFor="filter-category" className="mb-1.5">
                  Categoría
                </Label>
                <Select
                  id="filter-category"
                  value={currentCategoryId}
                  onChange={(e) => setParam('categoryId', e.target.value || null)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <ToggleRow
                title="Stock bajo"
                description="Solo productos con 5 o menos unidades."
                checked={currentLowStock}
                onCheckedChange={(checked) => setParam('lowStock', checked ? '1' : null)}
              />

              <ToggleRow
                title="Sin imagen"
                description="Productos que aún no tienen fotos."
                checked={currentNoImage}
                onCheckedChange={(checked) => setParam('noImage', checked ? '1' : null)}
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                className="font-sans text-[13px] font-medium text-fg-muted hover:text-fg"
                onClick={() => {
                  setParam('categoryId', null);
                  setParam('lowStock', null);
                  setParam('noImage', null);
                }}
              >
                Limpiar filtros
              </button>
              <SheetClose asChild>
                <Button size="md" variant="primary">
                  Aplicar
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div
        role="tablist"
        aria-label="Estado de productos"
        className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1"
      >
        {tabs.map((t) => {
          const active = t.value === currentTab;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParam('tab', t.value === 'todos' ? null : t.value)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5',
                'font-sans text-[13px] font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                  active
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-surface-alt text-fg-muted',
                )}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-bg px-4 py-3.5">
      <div className="flex-1">
        <p className="font-sans text-[14px] font-medium text-fg">{title}</p>
        <p className="mt-0.5 font-sans text-[11px] text-fg-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </label>
  );
}
