'use client';

import { Filter } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import {
  PRICE_RANGES,
  type PriceRangeKey,
  isPriceRangeKey,
} from '@/server/queries/listing';

type Brand = { id: string; name: string };

type Props = {
  brands: Brand[];
};

export function FilterSheet({ brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPriceRaw = searchParams.get('precio');
  const urlPrice: PriceRangeKey | null = isPriceRangeKey(urlPriceRaw) ? urlPriceRaw : null;
  const urlInStock = searchParams.get('disponible') === '1';
  const urlBrandIds = (searchParams.get('marca') ?? '').split(',').filter(Boolean);

  const activeCount =
    (urlPrice ? 1 : 0) + (urlInStock ? 1 : 0) + (urlBrandIds.length > 0 ? 1 : 0);

  const [open, setOpen] = useState(false);
  // Local draft so the user can preview changes; commit on Apply.
  const [price, setPrice] = useState<PriceRangeKey | null>(urlPrice);
  const [inStock, setInStock] = useState(urlInStock);
  const [brandIds, setBrandIds] = useState<string[]>(urlBrandIds);

  // When opening the sheet, sync local draft with URL — handles back/forward.
  const onOpenChange = (next: boolean) => {
    if (next) {
      setPrice(urlPrice);
      setInStock(urlInStock);
      setBrandIds(urlBrandIds);
    }
    setOpen(next);
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (price) params.set('precio', price);
    else params.delete('precio');
    if (inStock) params.set('disponible', '1');
    else params.delete('disponible');
    if (brandIds.length > 0) params.set('marca', brandIds.join(','));
    else params.delete('marca');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  const clear = () => {
    setPrice(null);
    setInStock(false);
    setBrandIds([]);
  };

  const toggleBrand = (id: string) => {
    setBrandIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Filtros"
          className={cn(
            'relative inline-flex h-10 items-center gap-1.5 rounded-full border bg-bg px-4',
            'font-sans text-[13px] font-medium text-fg-muted',
            'transition-colors hover:border-border-strong hover:text-fg',
            activeCount > 0 ? 'border-primary text-primary' : 'border-border',
          )}
        >
          <Filter aria-hidden className="h-4 w-4" strokeWidth={1.75} />
          Filtros
          {activeCount > 0 && (
            <span
              aria-hidden
              className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 font-sans text-[10px] font-semibold text-primary-foreground"
            >
              {activeCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-xl bg-surface p-5 pt-6">
        <SheetTitle className="font-serif text-h3 font-medium">Filtros</SheetTitle>
        <SheetDescription>Refina por precio, disponibilidad o marca.</SheetDescription>

        <div className="mt-5 flex max-h-[60vh] flex-col gap-6 overflow-y-auto">
          <Section>
            <Label className="mb-2 block">Precio</Label>
            <div className="flex flex-wrap gap-1.5">
              <Chip selected={price === null} onClick={() => setPrice(null)}>
                Todos
              </Chip>
              {(Object.keys(PRICE_RANGES) as PriceRangeKey[]).map((key) => (
                <Chip
                  key={key}
                  selected={price === key}
                  onClick={() => setPrice(key)}
                >
                  {PRICE_RANGES[key].label}
                </Chip>
              ))}
            </div>
          </Section>

          <Section>
            <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-bg px-4 py-3.5">
              <div className="flex-1">
                <p className="font-sans text-[14px] font-medium text-fg">
                  Solo disponibles
                </p>
                <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
                  Excluye productos agotados.
                </p>
              </div>
              <Switch
                checked={inStock}
                onCheckedChange={(checked) => setInStock(!!checked)}
                aria-label="Solo disponibles"
              />
            </label>
          </Section>

          {brands.length > 0 && (
            <Section>
              <Label className="mb-2 block">Marca</Label>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <Chip
                    key={b.id}
                    selected={brandIds.includes(b.id)}
                    onClick={() => toggleBrand(b.id)}
                  >
                    {b.name}
                  </Chip>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            className="font-sans text-[13px] font-medium text-fg-muted hover:text-fg"
            onClick={clear}
          >
            Limpiar filtros
          </button>
          <SheetClose asChild>
            <Button size="md" variant="primary" onClick={apply}>
              Aplicar
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function Chip({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-9 items-center rounded-full border px-3.5',
        'font-sans text-[12px] font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-bg text-fg-muted hover:border-border-strong hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
