import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FilterSheet } from '@/components/public/listing/filter-sheet';
import { ListingHeader } from '@/components/public/listing/listing-header';
import { ProductsGrid } from '@/components/public/listing/products-grid';
import { SortSelect } from '@/components/public/listing/sort-select';
import { JsonLd, breadcrumbSchema } from '@/lib/structured-data';
import {
  type ListingFilters,
  type SortOrder,
  getCategoryListing,
  isPriceRangeKey,
  isSortOrder,
} from '@/server/queries/listing';

export const revalidate = 60;

type SearchParams = {
  precio?: string;
  disponible?: string;
  marca?: string;
  orden?: string;
};

type PageProps = {
  params: { slug: string };
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Lightweight pre-fetch for title — we just need the name. Falls back to a
  // generic title if the slug is invalid; the page itself will 404.
  const listing = await getCategoryListing(params.slug, EMPTY_FILTERS, 'nuevo');
  if (!listing) {
    return {
      title: 'Categoría · Ámantis',
      description: 'Catálogo Ámantis · bienestar e intimidad para mayores de 18 años.',
    };
  }
  const title = `${listing.category.name} · Ámantis`;
  const description = `Productos de ${listing.category.name} disponibles en Ámantis. Pedidos por WhatsApp.`;
  const canonical = `/categoria/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const EMPTY_FILTERS: ListingFilters = {
  priceRange: null,
  inStock: false,
  brandIds: [],
};

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const sort: SortOrder = isSortOrder(searchParams.orden) ? searchParams.orden : 'nuevo';
  const priceRange = isPriceRangeKey(searchParams.precio) ? searchParams.precio : null;
  const inStock = searchParams.disponible === '1';
  const brandIds =
    searchParams.marca?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];

  const filters: ListingFilters = { priceRange, inStock, brandIds };

  const listing = await getCategoryListing(params.slug, filters, sort);
  if (!listing) notFound();

  const isFiltering =
    !!filters.priceRange || filters.inStock || filters.brandIds.length > 0;

  const breadcrumbs = [
    { name: 'Inicio', path: '/' },
    ...(listing.category.parentName && listing.category.parentSlug
      ? [
          {
            name: listing.category.parentName,
            path: `/categoria/${listing.category.parentSlug}`,
          },
        ]
      : []),
    { name: listing.category.name, path: `/categoria/${listing.category.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <ListingHeader
        name={listing.category.name}
        parentName={listing.category.parentName}
        totalCount={listing.totalCount}
      />

      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-border/40 bg-bg/85 px-4 py-2 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/70">
        <FilterSheet brands={listing.availableBrands} />
        <SortSelect />
      </div>

      {listing.totalCount === 0 ? (
        <EmptyState isFiltering={isFiltering} />
      ) : (
        <div className="pt-5">
          <ProductsGrid
            slug={params.slug}
            initialProducts={listing.products}
            initialCursor={listing.nextCursor}
            sort={sort}
            priceRange={priceRange}
            inStock={inStock}
            brandIds={brandIds}
          />
        </div>
      )}

      <div className="h-8" aria-hidden />
    </>
  );
}

function EmptyState({ isFiltering }: { isFiltering: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="font-serif text-h3 font-medium text-fg">
        {isFiltering ? 'Sin coincidencias' : 'Aún no hay productos en esta categoría'}
      </h2>
      <p className="mt-2 max-w-sm font-sans text-[13px] leading-relaxed text-fg-muted">
        {isFiltering
          ? 'Ajusta los filtros para ver más resultados.'
          : 'Pronto tendremos novedades aquí. Mientras tanto, explora otras categorías desde el inicio.'}
      </p>
    </div>
  );
}
