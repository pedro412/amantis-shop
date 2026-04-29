import { ProductsRow } from '@/components/public/home/products-row';
import type { HomeProduct } from '@/server/queries/home';

type Props = {
  products: HomeProduct[];
};

export function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;
  return <ProductsRow title="También te puede interesar" products={products} />;
}
