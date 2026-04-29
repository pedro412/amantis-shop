import type { Prisma } from '@prisma/client';

import { prisma } from '@/server/lib/prisma';

export const PAGE_SIZE = 20;

export type SortOrder = 'nuevo' | 'precio-asc' | 'precio-desc';

export type PriceRangeKey = 'lt-500' | '500-1500' | '1500-3000' | 'gt-3000';

export type ListingFilters = {
  priceRange: PriceRangeKey | null;
  inStock: boolean;
  brandIds: string[];
};

export type ListingProduct = {
  id: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string | null;
  imageKey: string | null;
};

export type ListingCategoryHeader = {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  parentSlug: string | null;
};

export type ListingPage = {
  category: ListingCategoryHeader;
  /** Brands available in this category (with at least one matching product). */
  availableBrands: { id: string; name: string }[];
  totalCount: number;
  products: ListingProduct[];
  /** ID of the last product in this page; null when there are no more. */
  nextCursor: string | null;
};

export const PRICE_RANGES: Record<
  PriceRangeKey,
  { label: string; min?: number; max?: number }
> = {
  'lt-500': { label: 'Hasta $500', max: 500 },
  '500-1500': { label: '$500 – $1,500', min: 500, max: 1500 },
  '1500-3000': { label: '$1,500 – $3,000', min: 1500, max: 3000 },
  'gt-3000': { label: 'Más de $3,000', min: 3000 },
};

const SORT_ORDER_BY: Record<SortOrder, Prisma.ProductOrderByWithRelationInput[]> = {
  nuevo: [{ createdAt: 'desc' }, { id: 'desc' }],
  'precio-asc': [{ price: 'asc' }, { id: 'asc' }],
  'precio-desc': [{ price: 'desc' }, { id: 'desc' }],
};

export function isSortOrder(v: unknown): v is SortOrder {
  return v === 'nuevo' || v === 'precio-asc' || v === 'precio-desc';
}

export function isPriceRangeKey(v: unknown): v is PriceRangeKey {
  return (
    v === 'lt-500' || v === '500-1500' || v === '1500-3000' || v === 'gt-3000'
  );
}

/**
 * Resolve a category by slug + collect direct child IDs so a parent listing
 * also surfaces sub-category products. Returns null when the slug doesn't
 * match a visible category.
 */
async function resolveCategoryScope(slug: string): Promise<{
  header: ListingCategoryHeader;
  categoryIds: string[];
} | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      deletedAt: true,
      parent: { select: { name: true, slug: true } },
      children: {
        where: { isActive: true, deletedAt: null },
        select: { id: true },
      },
    },
  });
  if (!category || !category.isActive || category.deletedAt) return null;

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  return {
    header: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentName: category.parent?.name ?? null,
      parentSlug: category.parent?.slug ?? null,
    },
    categoryIds,
  };
}

function priceWhere(key: PriceRangeKey | null): Prisma.ProductWhereInput {
  if (!key) return {};
  const range = PRICE_RANGES[key];
  const price: Prisma.DecimalFilter = {};
  if (range.min !== undefined) price.gte = range.min;
  if (range.max !== undefined) price.lt = range.max;
  return Object.keys(price).length > 0 ? { price } : {};
}

function buildWhere(
  categoryIds: string[],
  filters: ListingFilters,
): Prisma.ProductWhereInput {
  return {
    deletedAt: null,
    isActive: true,
    images: { some: {} },
    categoryId: { in: categoryIds },
    ...priceWhere(filters.priceRange),
    ...(filters.inStock ? { stock: { gt: 0 } } : {}),
    ...(filters.brandIds.length > 0 ? { brandId: { in: filters.brandIds } } : {}),
  };
}

/** First-page render: header + brand options + total + 20 products + cursor. */
export async function getCategoryListing(
  slug: string,
  filters: ListingFilters,
  sort: SortOrder,
): Promise<ListingPage | null> {
  const scope = await resolveCategoryScope(slug);
  if (!scope) return null;

  const where = buildWhere(scope.categoryIds, filters);

  const [products, totalCount, brandRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_ORDER_BY[sort],
      take: PAGE_SIZE,
      select: productSelect,
    }),
    prisma.product.count({ where }),
    // Brand options derived from the unfiltered category scope so the user
    // sees every brand the category contains, not just the current filter
    // intersection.
    prisma.brand.findMany({
      where: {
        deletedAt: null,
        products: {
          some: {
            deletedAt: null,
            isActive: true,
            images: { some: {} },
            categoryId: { in: scope.categoryIds },
          },
        },
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return {
    category: scope.header,
    availableBrands: brandRows,
    totalCount,
    products: products.map(toListingProduct),
    nextCursor: products.length === PAGE_SIZE ? products[products.length - 1]!.id : null,
  };
}

/** Subsequent pages — same shape, no header/brand metadata refetch. */
export async function getCategoryListingPage(
  slug: string,
  filters: ListingFilters,
  sort: SortOrder,
  cursor: string,
): Promise<{ products: ListingProduct[]; nextCursor: string | null } | null> {
  const scope = await resolveCategoryScope(slug);
  if (!scope) return null;

  const where = buildWhere(scope.categoryIds, filters);

  const products = await prisma.product.findMany({
    where,
    orderBy: SORT_ORDER_BY[sort],
    take: PAGE_SIZE,
    skip: 1,
    cursor: { id: cursor },
    select: productSelect,
  });

  return {
    products: products.map(toListingProduct),
    nextCursor: products.length === PAGE_SIZE ? products[products.length - 1]!.id : null,
  };
}

const productSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  compareAtPrice: true,
  images: {
    orderBy: { sortOrder: 'asc' },
    take: 1,
    select: { key: true },
  },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function toListingProduct(row: ProductRow): ListingProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price.toString(),
    compareAtPrice: row.compareAtPrice ? row.compareAtPrice.toString() : null,
    imageKey: row.images[0]?.key ?? null,
  };
}
