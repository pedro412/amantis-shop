import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ImageIcon, Plus } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { imagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';
import { prisma } from '@/server/lib/prisma';

export const metadata: Metadata = {
  title: 'Categorías · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const session = await auth();

  const categories = await prisma.category.findMany({
    where: { deletedAt: null, parentId: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { products: { where: { deletedAt: null } } } },
      children: {
        where: { deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
      },
    },
  });

  const newAction = (
    <Button asChild size="sm" variant="primary" className="h-9 px-3.5 text-[13px]">
      <Link href="/admin/categorias/nueva">
        <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
        Nueva
      </Link>
    </Button>
  );

  return (
    <>
      <AdminHeader
        title="Categorías"
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? ''}
        action={newAction}
      />

      {categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-4 pb-4 pt-3">
          <p className="px-2 pb-3 font-sans text-[12px] leading-relaxed text-fg-muted">
            Toca una categoría para editarla.
          </p>
          <ul className="flex flex-col gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <CategoryRow
                  id={c.id}
                  name={c.name}
                  imageKey={c.imageKey}
                  isActive={c.isActive}
                  productCount={c._count.products}
                />
                {c.children.length > 0 && (
                  <ul className="ml-5 mt-2 flex flex-col gap-1.5 border-l border-border pl-4">
                    {c.children.map((child) => (
                      <li key={child.id}>
                        <CategoryRow
                          id={child.id}
                          name={child.name}
                          imageKey={child.imageKey}
                          isActive={child.isActive}
                          productCount={child._count.products}
                          variant="child"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function CategoryRow({
  id,
  name,
  imageKey,
  isActive,
  productCount,
  variant = 'parent',
}: {
  id: string;
  name: string;
  imageKey: string | null;
  isActive: boolean;
  productCount: number;
  variant?: 'parent' | 'child';
}) {
  const isChild = variant === 'child';
  return (
    <Link
      href={`/admin/categorias/${id}`}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-surface',
        'transition-colors duration-base ease-smooth hover:border-border-strong',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        isChild ? 'px-3 py-2.5' : 'px-3.5 py-3',
      )}
    >
      <Thumb imageKey={imageKey} alt={name} size={isChild ? 32 : 40} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate font-sans font-medium text-fg',
            isChild ? 'text-[13px]' : 'text-[14px]',
          )}
        >
          {name}
        </p>
        <p
          className={cn(
            'mt-0.5 font-sans text-fg-muted',
            isChild ? 'text-[10.5px]' : 'text-[11px]',
          )}
        >
          {productCount} {productCount === 1 ? 'producto' : 'productos'}
        </p>
      </div>
      <ActiveDot active={isActive} />
      <ChevronRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-fg-subtle"
        strokeWidth={1.75}
      />
    </Link>
  );
}

function Thumb({
  imageKey,
  alt,
  size = 40,
}: {
  imageKey: string | null;
  alt: string;
  size?: number;
}) {
  const dim = size === 32 ? 'h-8 w-8' : 'h-10 w-10';
  if (imageKey) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imagePublicUrl(imageKey, 'thumb')}
        alt={alt}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-md object-cover', dim)}
        draggable={false}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary/60',
        dim,
      )}
    >
      <ImageIcon className={size === 32 ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={1.75} />
    </div>
  );
}

function ActiveDot({ active }: { active: boolean }) {
  return (
    <span
      aria-label={active ? 'Activa' : 'Inactiva'}
      className={cn(
        'h-1.5 w-1.5 shrink-0 rounded-full',
        active ? 'bg-success' : 'bg-fg-subtle/60',
      )}
    />
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="font-serif text-h2 font-medium text-fg">
        Aún no tienes categorías
      </h2>
      <p className="mt-2 max-w-xs font-sans text-[13px] leading-relaxed text-fg-muted">
        Crea la primera para empezar a organizar tu catálogo. Después podrás
        agregarle productos.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/admin/categorias/nueva">
          <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
          Crear la primera
        </Link>
      </Button>
    </div>
  );
}
