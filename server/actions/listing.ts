'use server';

import {
  type ListingFilters,
  type ListingProduct,
  type SortOrder,
  getCategoryListingPage,
  isPriceRangeKey,
  isSortOrder,
} from '@/server/queries/listing';

export type LoadMoreResult =
  | { ok: true; products: ListingProduct[]; nextCursor: string | null }
  | { error: string };

type Input = {
  slug: string;
  cursor: string;
  sort: string;
  priceRange: string | null;
  inStock: boolean;
  brandIds: string[];
};

export async function loadMoreProductsAction(input: Input): Promise<LoadMoreResult> {
  if (!input.slug || !input.cursor) {
    return { error: 'Parámetros inválidos.' };
  }

  const sort: SortOrder = isSortOrder(input.sort) ? input.sort : 'nuevo';
  const priceRange = isPriceRangeKey(input.priceRange) ? input.priceRange : null;
  const filters: ListingFilters = {
    priceRange,
    inStock: !!input.inStock,
    brandIds: Array.isArray(input.brandIds) ? input.brandIds.filter((s) => typeof s === 'string') : [],
  };

  try {
    const page = await getCategoryListingPage(input.slug, filters, sort, input.cursor);
    if (!page) return { error: 'Categoría no encontrada.' };
    return { ok: true, products: page.products, nextCursor: page.nextCursor };
  } catch (err) {
    console.error('[loadMoreProductsAction] failed', err);
    return { error: 'No pudimos cargar más productos.' };
  }
}
