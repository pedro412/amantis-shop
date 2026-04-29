import type { Metadata } from 'next';

import { CategoriesGrid } from '@/components/public/home/categories-grid';
import { HomeHero } from '@/components/public/home/hero';
import { ProductsRow } from '@/components/public/home/products-row';
import { TrustStrip } from '@/components/public/home/trust-strip';
import {
  getFeaturedProducts,
  getHomeCategories,
  getNovedades,
} from '@/server/queries/home';

const HOME_TITLE = 'Ámantis · Bienestar e intimidad';
const HOME_DESCRIPTION =
  'Catálogo de productos para el bienestar y la intimidad. Pedidos por WhatsApp con envío local. Solo para mayores de 18 años.';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

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
