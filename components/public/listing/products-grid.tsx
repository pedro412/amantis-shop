'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { ProductCard } from '@/components/public/product-card';
import { loadMoreProductsAction } from '@/server/actions/listing';
import type { ListingProduct, PriceRangeKey, SortOrder } from '@/server/queries/listing';

type Props = {
  slug: string;
  initialProducts: ListingProduct[];
  initialCursor: string | null;
  sort: SortOrder;
  priceRange: PriceRangeKey | null;
  inStock: boolean;
  brandIds: string[];
};

export function ProductsGrid({
  slug,
  initialProducts,
  initialCursor,
  sort,
  priceRange,
  inStock,
  brandIds,
}: Props) {
  const [products, setProducts] = useState<ListingProduct[]>(initialProducts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Track which cursor we already requested so a single observer entry can't
  // double-fire load-more during the transition window.
  const inFlightCursorRef = useRef<string | null>(null);

  // When filters / sort change at the URL level, the parent page re-renders
  // with new props — reset local state to those props.
  const brandIdsKey = brandIds.join(',');
  useEffect(() => {
    setProducts(initialProducts);
    setCursor(initialCursor);
    setError(undefined);
    inFlightCursorRef.current = null;
  }, [initialProducts, initialCursor, sort, priceRange, inStock, brandIdsKey]);

  useEffect(() => {
    if (!cursor) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (!cursor || pending || inFlightCursorRef.current === cursor) return;
        inFlightCursorRef.current = cursor;
        startTransition(async () => {
          const result = await loadMoreProductsAction({
            slug,
            cursor,
            sort,
            priceRange,
            inStock,
            brandIds,
          });
          if ('error' in result) {
            setError(result.error);
            inFlightCursorRef.current = null;
            return;
          }
          setProducts((prev) => [...prev, ...result.products]);
          setCursor(result.nextCursor);
          inFlightCursorRef.current = null;
        });
      },
      { rootMargin: '300px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, pending, slug, sort, priceRange, inStock, brandIds]);

  const retry = () => {
    if (!cursor) return;
    setError(undefined);
    inFlightCursorRef.current = null;
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-6 px-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard
              slug={p.slug}
              name={p.name}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              imageKey={p.imageKey}
              className="w-full"
            />
          </li>
        ))}
      </ul>

      {cursor && (
        <div
          ref={sentinelRef}
          aria-hidden
          className="h-10 w-full"
        />
      )}

      {pending && (
        <p
          role="status"
          className="px-4 pb-2 text-center font-sans text-[12px] text-fg-muted"
        >
          Cargando más…
        </p>
      )}

      {error && (
        <div className="px-4 pb-2 text-center">
          <p role="alert" className="font-sans text-[12px] text-destructive">
            {error}
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-1 font-sans text-[12px] font-medium text-primary underline-offset-2 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}
    </>
  );
}
