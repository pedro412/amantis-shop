/**
 * Lightweight queries for the public sitemap. Only returns slugs + lastmod so
 * the sitemap can render thousands of entries without bloating the response.
 */

import { prisma } from '@/server/lib/prisma';

export type SitemapEntry = {
  slug: string;
  updatedAt: Date;
};

/**
 * Active categories that have at least one visible product, either directly
 * or through an active child. Mirrors the public listing scope so we don't
 * surface category pages that would render as empty.
 */
export async function getSitemapCategories(): Promise<SitemapEntry[]> {
  const visibleProduct = {
    isActive: true,
    deletedAt: null,
    images: { some: {} },
  };

  return prisma.category.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { products: { some: visibleProduct } },
        {
          children: {
            some: {
              isActive: true,
              deletedAt: null,
              products: { some: visibleProduct },
            },
          },
        },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    select: { slug: true, updatedAt: true },
  });
}

/** Public products: active, not soft-deleted, with at least one image. */
export async function getSitemapProducts(): Promise<SitemapEntry[]> {
  return prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      images: { some: {} },
    },
    orderBy: { updatedAt: 'desc' },
    select: { slug: true, updatedAt: true },
  });
}
