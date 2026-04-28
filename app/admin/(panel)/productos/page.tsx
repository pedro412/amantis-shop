import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ImageIcon, Layers3, Package, Plus, SearchX } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { formatMXN } from '@/lib/format';
import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';
import { prisma } from '@/server/lib/prisma';

import { ProductosFilters } from './productos-filters';

export const metadata: Metadata = {
  title: 'Productos · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const TAB_VALUES = ['todos', 'activos', 'borradores', 'agotados'] as const;
type TabValue = (typeof TAB_VALUES)[number];
const isTabValue = (v: string | undefined): v is TabValue =>
  !!v && (TAB_VALUES as readonly string[]).includes(v);

const LOW_STOCK_THRESHOLD = 5;
const PAGE_SIZE = 100;

type SearchParams = {
  q?: string;
  tab?: string;
  categoryId?: string;
  lowStock?: string;
  noImage?: string;
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const tab: TabValue = isTabValue(searchParams.tab) ? searchParams.tab : 'todos';
  const q = searchParams.q?.trim() ?? '';
  const categoryId = searchParams.categoryId?.trim() ?? '';
  const lowStock = searchParams.lowStock === '1';
  const noImage = searchParams.noImage === '1';

  const baseWhere = { deletedAt: null } as const;
  const tabWhere =
    tab === 'activos'
      ? { isActive: true }
      : tab === 'borradores'
        ? { isActive: false }
        : tab === 'agotados'
          ? { stock: 0 }
          : {};

  const filterWhere = {
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(lowStock ? { stock: { lte: LOW_STOCK_THRESHOLD } } : {}),
    ...(noImage ? { images: { none: {} } } : {}),
  };

  const where = { ...baseWhere, ...tabWhere, ...filterWhere };

  const [session, products, tabCounts, categories] = await Promise.all([
    auth(),
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { key: true },
        },
        _count: { select: { variants: true } },
      },
    }),
    Promise.all([
      prisma.product.count({ where: baseWhere }),
      prisma.product.count({ where: { ...baseWhere, isActive: true } }),
      prisma.product.count({ where: { ...baseWhere, isActive: false } }),
      prisma.product.count({ where: { ...baseWhere, stock: 0 } }),
    ]),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const tabs = [
    { value: 'todos' as const, label: 'Todos', count: tabCounts[0] },
    { value: 'activos' as const, label: 'Activos', count: tabCounts[1] },
    { value: 'borradores' as const, label: 'Borradores', count: tabCounts[2] },
    { value: 'agotados' as const, label: 'Agotados', count: tabCounts[3] },
  ];

  const newAction = (
    <Button asChild size="sm" variant="primary" className="h-9 px-3.5 text-[13px]">
      <Link href="/admin/productos/nuevo">
        <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
        Nuevo
      </Link>
    </Button>
  );

  const totalCatalog = tabCounts[0];
  const isFiltering = q !== '' || categoryId !== '' || lowStock || noImage || tab !== 'todos';

  return (
    <>
      <AdminHeader
        title="Productos"
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? ''}
        action={newAction}
      />

      <div className="px-4 py-3">
        <ProductosFilters tabs={tabs} categories={categories} />
      </div>

      {totalCatalog === 0 ? (
        <NoProductsYet />
      ) : products.length === 0 ? (
        <NoMatches isFiltering={isFiltering} />
      ) : (
        <ul className="flex flex-col gap-2 px-4 pb-6">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                compareAtPrice={p.compareAtPrice ? Number(p.compareAtPrice) : null}
                stock={p.stock}
                isActive={p.isActive}
                categoryName={p.category.name}
                imageKey={p.images[0]?.key ?? null}
                variantCount={p._count.variants}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  stock,
  isActive,
  categoryName,
  imageKey,
  variantCount,
}: {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isActive: boolean;
  categoryName: string;
  imageKey: string | null;
  variantCount: number;
}) {
  const src = imageKey ? tryImagePublicUrl(imageKey, 'thumb') : null;

  return (
    <Link
      href={`/admin/productos/${id}`}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3',
        'transition-colors duration-base ease-smooth hover:border-border-strong',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      )}
    >
      <Thumb src={src} alt={name} dim="h-14 w-14" iconClass="h-5 w-5" draft={!isActive} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-[14px] font-medium text-fg">{name}</p>
        <p className="mt-0.5 truncate font-sans text-[11px] text-fg-muted">
          {categoryName} <span className="text-fg-subtle">·</span> {formatMXN(price)}
          {compareAtPrice && compareAtPrice > price ? (
            <span className="ml-1 text-fg-subtle line-through">
              {formatMXN(compareAtPrice)}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[11px] font-medium">
          <span className={cn(stockToneClass(stock))}>
            {stock === 0 ? 'Agotado' : `${stock} en stock`}
          </span>
          {variantCount > 0 && (
            <>
              <span aria-hidden className="text-fg-subtle">·</span>
              <span className="inline-flex items-center gap-1 text-fg-muted">
                <Layers3 aria-hidden className="h-3 w-3" strokeWidth={2} />
                {variantCount} {variantCount === 1 ? 'variante' : 'variantes'}
              </span>
            </>
          )}
        </p>
      </div>
      <ChevronRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-fg-subtle"
        strokeWidth={1.75}
      />
    </Link>
  );
}

function stockToneClass(stock: number): string {
  if (stock === 0) return 'text-destructive';
  if (stock < LOW_STOCK_THRESHOLD) return 'text-warning';
  return 'text-fg-muted';
}

function Thumb({
  src,
  alt,
  dim,
  iconClass,
  draft,
}: {
  src: string | null;
  alt: string;
  dim: string;
  iconClass: string;
  draft?: boolean;
}) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-md', dim)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div
          aria-hidden
          className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/60"
        >
          <ImageIcon className={iconClass} strokeWidth={1.75} />
        </div>
      )}
      {draft && (
        <span
          aria-hidden
          className="absolute inset-0 flex items-end justify-start bg-fg/35 p-1 font-sans text-[9px] font-medium uppercase tracking-[0.06em] text-fg-inverse"
        >
          Borrador
        </span>
      )}
    </div>
  );
}

function NoProductsYet() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Package aria-hidden className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h2 className="font-serif text-h2 font-medium text-fg">
        Aún no tienes productos
      </h2>
      <p className="mt-2 max-w-xs font-sans text-[13px] leading-relaxed text-fg-muted">
        Crea el primero para empezar a poblar tu catálogo. Vas a poder asignarle
        categoría, precio y fotos.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/admin/productos/nuevo">
          <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
          Crear el primero
        </Link>
      </Button>
    </div>
  );
}

function NoMatches({ isFiltering }: { isFiltering: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-fg-muted">
        <SearchX aria-hidden className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h2 className="font-serif text-h3 font-medium text-fg">
        {isFiltering ? 'Sin coincidencias' : 'No hay productos en esta vista'}
      </h2>
      <p className="mt-2 max-w-xs font-sans text-[13px] leading-relaxed text-fg-muted">
        {isFiltering
          ? 'Ajusta la búsqueda o limpia los filtros para ver más resultados.'
          : 'Esta pestaña no tiene productos por ahora.'}
      </p>
    </div>
  );
}
