import { CategoriesGrid } from '@/components/public/home/categories-grid';
import { HomeHero } from '@/components/public/home/hero';
import { ProductsRow } from '@/components/public/home/products-row';
import { TrustStrip } from '@/components/public/home/trust-strip';
import {
  getFeaturedProducts,
  getHomeCategories,
  getNovedades,
} from '@/server/queries/home';

// Cached page render. Product/category server actions call revalidatePath('/')
// after mutations so edits show up here within the next request.
export const revalidate = 60;

export default async function Home() {
  const [categories, featured, novedades] = await Promise.all([
    getHomeCategories(),
    getFeaturedProducts(),
    getNovedades(),
  ]);

  return (
    <>
      <HomeHero />
      <CategoriesGrid categories={categories} />
      <ProductsRow title="Destacados" products={featured} />
      <ProductsRow title="Novedades" products={novedades} />
      <TrustStrip />
      <div className="h-8" aria-hidden />
    </>
  );
}
