import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductBackButton } from '@/components/public/product/product-back-button';
import { ProductDescription } from '@/components/public/product/product-description';
import { ProductGallery } from '@/components/public/product/product-gallery';
import { ProductInteractive } from '@/components/public/product/product-interactive';
import { RelatedProducts } from '@/components/public/product/related-products';
import { getProductBySlug, getRelatedProducts } from '@/server/queries/product';

export const revalidate = 60;

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Producto · Ámantis',
      description: 'Catálogo Ámantis · bienestar e intimidad para mayores de 18 años.',
    };
  }
  const description =
    product.shortDescription ??
    `${product.name} · ${product.category.name} en Ámantis.`;
  return {
    title: `${product.name} · Ámantis`,
    description,
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category.id);

  return (
    <>
      <div className="relative">
        <ProductBackButton />
        <ProductGallery imageKeys={product.imageKeys} alt={product.name} />
      </div>

      <ProductInteractive product={product} />

      {product.description && product.description.trim().length > 0 && (
        <ProductDescription text={product.description} />
      )}

      <RelatedProducts products={related} />

      <div className="h-8" aria-hidden />
    </>
  );
}
