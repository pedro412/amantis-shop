import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { prisma } from '@/server/lib/prisma';

import { CategoryForm } from '../category-form';
import { DangerZone } from '../danger-zone';

export const metadata: Metadata = {
  title: 'Editar categoría · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EditarCategoriaPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { products: { where: { deletedAt: null } } } },
    },
  });

  if (!category || category.deletedAt) notFound();

  return (
    <>
      <AdminHeader
        title="Editar categoría"
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? ''}
        action={
          <Link
            href="/admin/categorias"
            aria-label="Volver"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-alt hover:text-fg"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        }
      />
      <div className="space-y-6 px-5 py-5">
        <CategoryForm
          mode={{
            kind: 'edit',
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              imageKey: category.imageKey,
              isActive: category.isActive,
            },
          }}
        />

        <DangerZone categoryId={category.id} productCount={category._count.products} />
      </div>
    </>
  );
}
