import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { prisma } from '@/server/lib/prisma';

import { ProductDangerZone } from '../danger-zone';
import { ProductForm } from '../product-form';

export const metadata: Metadata = {
  title: 'Editar producto · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string };
}) {
  const [session, product, categoriesRaw] = await Promise.all([
    auth(),
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { key: true },
        },
      },
    }),
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

  if (!product || product.deletedAt) notFound();

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    isChild: c.parent !== null,
    parentName: c.parent?.name ?? null,
  }));

  return (
    <>
      <AdminHeader
        title="Editar producto"
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
      <div className="space-y-6 px-5 py-5">
        <ProductForm
          mode={{
            kind: 'edit',
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              shortDescription: product.shortDescription,
              description: product.description,
              price: product.price.toString(),
              compareAtPrice: product.compareAtPrice
                ? product.compareAtPrice.toString()
                : null,
              stock: product.stock,
              sku: product.sku,
              categoryId: product.categoryId,
              isActive: product.isActive,
              isFeatured: product.isFeatured,
              imageKeys: product.images.map((i) => i.key),
            },
          }}
          categories={categories}
        />

        <ProductDangerZone productId={product.id} />
      </div>
    </>
  );
}
