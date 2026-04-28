import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { prisma } from '@/server/lib/prisma';

import { CategoriasList, type ParentNode } from './categorias-list';

export const metadata: Metadata = {
  title: 'Categorías · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const session = await auth();

  const rows = await prisma.category.findMany({
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

  // Pre-massage to a serializable shape so the client component doesn't
  // need to import any Prisma types.
  const categories: ParentNode[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    imageKey: c.imageKey,
    isActive: c.isActive,
    productCount: c._count.products,
    children: c.children.map((child) => ({
      id: child.id,
      name: child.name,
      imageKey: child.imageKey,
      isActive: child.isActive,
      productCount: child._count.products,
    })),
  }));

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
        <CategoriasList categories={categories} />
      )}
    </>
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
