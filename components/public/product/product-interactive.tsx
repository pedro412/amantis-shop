'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { formatMXN } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProductDetail, ProductDetailVariant } from '@/server/queries/product';

type Props = {
  product: ProductDetail;
};

export function ProductInteractive({ product }: Props) {
  const { variants, price: basePrice, compareAtPrice, totalStock } = product;
  const hasVariants = variants.length > 0;

  // Pre-select the first available variant so the user lands on a buy-ready
  // state. Deterministic so SSR ↔ client match.
  const initialVariantId = useMemo<string | null>(() => {
    if (!hasVariants) return null;
    const firstAvailable = variants.find((v) => v.stock > 0);
    return firstAvailable?.id ?? null;
  }, [hasVariants, variants]);

  const [selectedId, setSelectedId] = useState<string | null>(initialVariantId);

  const selected: ProductDetailVariant | null = useMemo(() => {
    if (!hasVariants || !selectedId) return null;
    return variants.find((v) => v.id === selectedId) ?? null;
  }, [hasVariants, selectedId, variants]);

  const displayPrice =
    selected?.priceOverride && selected.priceOverride.length > 0
      ? selected.priceOverride
      : basePrice;
  const displayPriceNum = Number(displayPrice);
  const compareNum = compareAtPrice ? Number(compareAtPrice) : null;
  const onSale = compareNum !== null && compareNum > displayPriceNum;

  const available = hasVariants
    ? selected
      ? selected.stock > 0
      : variants.some((v) => v.stock > 0)
    : totalStock > 0;

  return (
    <div className="px-5 pt-5">
      <Link
        href={`/categoria/${product.category.slug}`}
        className="inline-block font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted hover:text-fg"
      >
        {product.category.name}
      </Link>

      <h1 className="mt-1.5 font-serif text-[26px] font-medium leading-[1.15] text-fg">
        {product.name}
      </h1>

      <div className="mt-3 flex items-end gap-3">
        <p className="font-serif text-[22px] font-semibold tabular-nums text-primary">
          {formatMXN(displayPriceNum)}
        </p>
        {onSale && (
          <p className="pb-1 font-sans text-[13px] tabular-nums text-fg-subtle line-through">
            {formatMXN(compareNum)}
          </p>
        )}
        <span
          className={cn(
            'ml-auto inline-flex h-7 items-center rounded-full px-3 font-sans text-[11px] font-semibold uppercase tracking-[0.06em]',
            available
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive',
          )}
        >
          {available ? 'Disponible' : 'Agotado'}
        </span>
      </div>

      {product.shortDescription && (
        <p className="mt-3 font-sans text-[14px] leading-relaxed text-fg-muted">
          {product.shortDescription}
        </p>
      )}

      {hasVariants && (
        <div className="mt-5">
          <p className="font-sans text-[12px] font-medium uppercase tracking-[0.06em] text-fg-muted">
            Opciones
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const isSelected = v.id === selectedId;
              const isOut = v.stock <= 0;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    disabled={isOut}
                    onClick={() => setSelectedId(v.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'inline-flex h-11 items-center rounded-full border px-4',
                      'font-sans text-[13px] font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                      isSelected
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border bg-bg text-fg-muted hover:border-border-strong hover:text-fg',
                      isOut && 'cursor-not-allowed text-fg-subtle line-through hover:border-border hover:text-fg-subtle',
                    )}
                  >
                    {v.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
