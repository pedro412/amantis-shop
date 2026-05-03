/**
 * Queries for the lateral categories drawer (header hamburguesa + "Ver todas"
 * en home). Returns active top-level categories grouped with their active
 * children, with product counts that mirror the listing page scope.
 *
 * Wrapped in React's `cache()` so multiple server components in the same
 * request (header + home) share a single DB round-trip.
 */

import { cache } from 'react';

import { prisma } from '@/server/lib/prisma';

export type DrawerSubCategory = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
};

export type DrawerCategory = {
  id: string;
  slug: string;
  name: string;
  /** Total visible products including this category + its children. */
  productCount: number;
  children: DrawerSubCategory[];
};

const VISIBLE_PRODUCT = {
  deletedAt: null,
  isActive: true,
  images: { some: {} },
} as const;

export const getDrawerCategories = cache(async (): Promise<DrawerCategory[]> => {
  const topLevels = await prisma.category.findMany({
    where: { parentId: null, isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      children: {
        where: { isActive: true, deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, slug: true, name: true },
      },
    },
  });

  const grouped = await Promise.all(
    topLevels.map(async (cat) => {
      const allCategoryIds = [cat.id, ...cat.children.map((c) => c.id)];
      const productCount = await prisma.product.count({
        where: { ...VISIBLE_PRODUCT, categoryId: { in: allCategoryIds } },
      });

      const children = await Promise.all(
        cat.children.map(async (child) => ({
          id: child.id,
          slug: child.slug,
          name: child.name,
          productCount: await prisma.product.count({
            where: { ...VISIBLE_PRODUCT, categoryId: child.id },
          }),
        })),
      );

      return {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        productCount,
        // Hide empty sub-categories so the drawer only shows browseable links.
        children: children.filter((c) => c.productCount > 0),
      };
    }),
  );

  // Hide top-levels that have no products at all (self or via children).
  return grouped.filter((cat) => cat.productCount > 0);
});
