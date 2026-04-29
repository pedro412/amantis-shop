import { prisma } from '@/server/lib/prisma';

export type SearchHit = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  price: string;
  imageKey: string | null;
};

const SEARCH_LIMIT = 20;

/**
 * Public search across name + descriptions + tags. Case-insensitive
 * `contains` is sufficient for the catalog scale we're targeting; tsvector
 * gets revisited if Shirley reports lag or relevance issues.
 */
export async function searchProducts(rawQ: string): Promise<SearchHit[]> {
  const q = rawQ.trim();
  if (q.length < 2) return [];

  const rows = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      images: { some: {} },
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
        { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
      ],
    },
    orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    take: SEARCH_LIMIT,
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      category: { select: { name: true } },
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
    categoryName: r.category.name,
    price: r.price.toString(),
    imageKey: r.images[0]?.key ?? null,
  }));
}
