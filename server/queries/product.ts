import { prisma } from '@/server/lib/prisma';
import type { HomeProduct } from '@/server/queries/home';

const RELATED_LIMIT = 8;

export type ProductDetailVariant = {
  id: string;
  name: string;
  sku: string | null;
  /** String to preserve decimal precision; null when variant has no override. */
  priceOverride: string | null;
  stock: number;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  /** Base price (used when no variant or selected variant has no override). */
  price: string;
  compareAtPrice: string | null;
  /** Aggregate stock — sum of variants when present, else product.stock. */
  totalStock: number;
  category: { id: string; name: string; slug: string };
  imageKeys: string[];
  variants: ProductDetailVariant[];
};

/** Public detail by slug. Returns null if hidden or missing. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      description: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      isActive: true,
      deletedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { key: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sku: true,
          priceOverride: true,
          stock: true,
        },
      },
    },
  });

  if (!row || !row.isActive || row.deletedAt) return null;
  // Public visibility rule: needs at least one image to be browsable.
  if (row.images.length === 0) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    price: row.price.toString(),
    compareAtPrice: row.compareAtPrice ? row.compareAtPrice.toString() : null,
    totalStock: row.stock,
    category: row.category,
    imageKeys: row.images.map((i) => i.key),
    variants: row.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceOverride: v.priceOverride ? v.priceOverride.toString() : null,
      stock: v.stock,
    })),
  };
}

/** Other products in the same category, excluding the current one. */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
): Promise<HomeProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      deletedAt: null,
      isActive: true,
      images: { some: {} },
    },
    orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    take: RELATED_LIMIT,
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      price: true,
      compareAtPrice: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: { key: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.shortDescription,
    price: r.price.toString(),
    compareAtPrice: r.compareAtPrice ? r.compareAtPrice.toString() : null,
    imageKey: r.images[0]?.key ?? null,
  }));
}
