import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductBackButton } from '@/components/public/product/product-back-button';
import { ProductCTA } from '@/components/public/product/product-cta';
import { ProductDescription } from '@/components/public/product/product-description';
import { ProductGallery } from '@/components/public/product/product-gallery';
import { ProductInteractive } from '@/components/public/product/product-interactive';
import { ProductSelectionProvider } from '@/components/public/product/product-selection-context';
import { ProductShareButton } from '@/components/public/product/product-share-button';
import { RelatedProducts } from '@/components/public/product/related-products';
import { tryImagePublicUrl } from '@/lib/image-url';
import {
  JsonLd,
  breadcrumbSchema,
  productSchema,
} from '@/lib/structured-data';
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
  const title = `${product.name} · Ámantis`;
  const canonical = `/producto/${product.slug}`;
  const firstImageKey = product.imageKeys[0];
  const ogImage = firstImageKey ? tryImagePublicUrl(firstImageKey, 'medium') : null;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: 'Ámantis',
      url: canonical,
      ...(ogImage && { images: [{ url: ogImage, alt: product.name }] }),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category.id);

  const inStock =
    product.totalStock > 0 ||
    product.variants.some((v) => v.stock > 0);

  const breadcrumbs = [
    { name: 'Inicio', path: '/' },
    {
      name: product.category.name,
      path: `/categoria/${product.category.slug}`,
    },
    { name: product.name, path: `/producto/${product.slug}` },
  ];

  return (
    <ProductSelectionProvider product={product}>
      <JsonLd
        data={[
          productSchema({
            slug: product.slug,
            name: product.name,
            description: product.shortDescription ?? product.description,
            price: product.price,
            imageKeys: product.imageKeys,
            category: { name: product.category.name },
            inStock,
          }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />
      <div className="relative">
        <ProductBackButton />
        <ProductShareButton name={product.name} />
        <ProductGallery imageKeys={product.imageKeys} alt={product.name} />
      </div>

      <ProductInteractive />

      {product.description && product.description.trim().length > 0 && (
        <ProductDescription text={product.description} />
      )}

      <RelatedProducts products={related} />

      {/* Reserve space for the fixed CTA bar (~60px = 8px padding * 2 + 44px button + 1px border). */}
      <div className="h-20" aria-hidden />

      <ProductCTA />
    </ProductSelectionProvider>
  );
}
