/**
 * Server queries for the public home page. Centralized so the page stays
 * declarative and any future cache invalidation lives next to the data shape.
 */

import { prisma } from '@/server/lib/prisma';

const FEATURED_LIMIT = 8;
const NOVEDADES_LIMIT = 8;

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  imageKey: string | null;
};

export type HomeCategory = {
  id: string;
  slug: string;
  name: string;
  imageKey: string | null;
  productCount: number;
};

/**
 * Top-level categories the user wants visible, in display order.
 *
 * Product count includes the category's direct products plus its visible
 * direct children's products — this mirrors the listing scope at
 * `/categoria/[slug]`, so the count on the card and the count in the
 * listing header always match. Visibility filters (active + image-required)
 * also mirror the public listing rules.
 */
export async function getHomeCategories(): Promise<HomeCategory[]> {
  const rows = await prisma.category.findMany({
    where: { parentId: null, isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      imageKey: true,
      children: {
        where: { isActive: true, deletedAt: null },
        select: { id: true },
      },
    },
  });

  return Promise.all(
    rows.map(async (c) => {
      const categoryIds = [c.id, ...c.children.map((ch) => ch.id)];
      const productCount = await prisma.product.count({
        where: {
          deletedAt: null,
          isActive: true,
          images: { some: {} },
          categoryId: { in: categoryIds },
        },
      });
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        imageKey: c.imageKey,
        productCount,
      };
    }),
  );
}

/** Featured products. Public requires at least one image to show. */
export async function getFeaturedProducts(): Promise<HomeProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true,
      deletedAt: null,
      images: { some: {} },
    },
    orderBy: [{ updatedAt: 'desc' }],
    take: FEATURED_LIMIT,
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
  return rows.map(toHomeProduct);
}

/** Most recent products that aren't already shown in the featured row. */
export async function getNovedades(): Promise<HomeProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      isFeatured: false,
      isActive: true,
      deletedAt: null,
      images: { some: {} },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: NOVEDADES_LIMIT,
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
  return rows.map(toHomeProduct);
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  images: { key: string }[];
};

function toHomeProduct(row: ProductRow): HomeProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    price: row.price.toString(),
    compareAtPrice: row.compareAtPrice ? row.compareAtPrice.toString() : null,
    imageKey: row.images[0]?.key ?? null,
  };
}
