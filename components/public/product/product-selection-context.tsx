'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ProductDetail, ProductDetailVariant } from '@/server/queries/product';

type ProductSelectionValue = {
  product: ProductDetail;
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string | null) => void;
  selectedVariant: ProductDetailVariant | null;
  /** Effective price as decimal string (variant override or base). */
  displayPrice: string;
  /** True when something can be ordered now. */
  available: boolean;
};

const ProductSelectionContext = createContext<ProductSelectionValue | null>(null);

export function ProductSelectionProvider({
  product,
  children,
}: {
  product: ProductDetail;
  children: React.ReactNode;
}) {
  const hasVariants = product.variants.length > 0;

  // Pre-select the first variant with stock so consumers (CTA, picker) land
  // on a buy-ready state. Deterministic so SSR ↔ client match.
  const initialVariantId = useMemo<string | null>(() => {
    if (!hasVariants) return null;
    return product.variants.find((v) => v.stock > 0)?.id ?? null;
  }, [hasVariants, product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId,
  );

  const value = useMemo<ProductSelectionValue>(() => {
    const selectedVariant = hasVariants
      ? product.variants.find((v) => v.id === selectedVariantId) ?? null
      : null;

    const displayPrice =
      selectedVariant?.priceOverride && selectedVariant.priceOverride.length > 0
        ? selectedVariant.priceOverride
        : product.price;

    const available = hasVariants
      ? selectedVariant
        ? selectedVariant.stock > 0
        : product.variants.some((v) => v.stock > 0)
      : product.totalStock > 0;

    return {
      product,
      selectedVariantId,
      setSelectedVariantId,
      selectedVariant,
      displayPrice,
      available,
    };
  }, [hasVariants, product, selectedVariantId]);

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection(): ProductSelectionValue {
  const ctx = useContext(ProductSelectionContext);
  if (!ctx) {
    throw new Error(
      'useProductSelection must be used within ProductSelectionProvider',
    );
  }
  return ctx;
}
