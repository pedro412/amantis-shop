import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { prisma } from '@/server/lib/prisma';

import { ProductForm } from '../product-form';

export const metadata: Metadata = {
  title: 'Nuevo producto · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NuevoProductoPage() {
  const [session, categoriesRaw] = await Promise.all([
    auth(),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        parent: { select: { name: true } },
      },
    }),
  ]);

  // Flatten parent → child rendering as `Padre › Hijo` in the option label so
  // admins can pick a subcategoría unambiguously without a nested control.
  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    isChild: c.parent !== null,
    parentName: c.parent?.name ?? null,
  }));

  return (
    <>
      <AdminHeader
        title="Nuevo producto"
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? ''}
        action={
          <Link
            href="/admin/productos"
            aria-label="Volver"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-alt hover:text-fg"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        }
      />
      <div className="px-5 py-5">
        <ProductForm mode={{ kind: 'create' }} categories={categories} />
      </div>
    </>
  );
}
