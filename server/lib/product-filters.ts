import type { Prisma } from '@prisma/client';

/**
 * Reusable `where` fragments shared by the products list and the admin
 * dashboard so a card's count never diverges from what the list shows when
 * that filter is toggled on.
 */

export const LOW_STOCK_THRESHOLD = 5;

/** Non-deleted, currently visible-to-public products. */
export const activeProductsWhere: Prisma.ProductWhereInput = {
  deletedAt: null,
  isActive: true,
};

/**
 * Active products at or below the low-stock threshold. Drafts (isActive:false)
 * are excluded — a draft with stock 0 isn't an urgent restock signal.
 */
export const lowStockProductsWhere: Prisma.ProductWhereInput = {
  deletedAt: null,
  isActive: true,
  stock: { lte: LOW_STOCK_THRESHOLD },
};

/** Non-deleted products with zero ProductImage rows. */
export const noImageProductsWhere: Prisma.ProductWhereInput = {
  deletedAt: null,
  images: { none: {} },
};

/**
 * Products whose category was soft-deleted. The schema requires categoryId,
 * so this is the closest equivalent to "sin categoría" — the product still
 * points to a category row, but that row is tombstoned.
 */
export const orphanCategoryProductsWhere: Prisma.ProductWhereInput = {
  deletedAt: null,
  category: { deletedAt: { not: null } },
};
