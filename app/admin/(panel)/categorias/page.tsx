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
                <Link
                  href={`/admin/categorias/${c.id}`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3',
                    'transition-colors duration-base ease-smooth hover:border-border-strong',
                    'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                  )}
                >
                  <Thumb imageKey={c.imageKey} alt={c.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[14px] font-medium text-fg">
                      {c.name}
                    </p>
                    <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
                      {c._count.products}{' '}
                      {c._count.products === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <ActiveDot active={c.isActive} />
                  <ChevronRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-fg-subtle"
                    strokeWidth={1.75}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Thumb({ imageKey, alt }: { imageKey: string | null; alt: string }) {
  if (imageKey) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imagePublicUrl(imageKey, 'thumb')}
        alt={alt}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-md object-cover"
        draggable={false}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary/60"
    >
      <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
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
