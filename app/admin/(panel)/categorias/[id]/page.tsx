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
  const [session, category, parents] = await Promise.all([
    auth(),
    prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            children: { where: { deletedAt: null } },
          },
        },
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: { id: true, name: true, isActive: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { deletedAt: null, parentId: null, id: { not: params.id } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

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
              parentId: category.parentId,
              isActive: category.isActive,
            },
            hasChildren: category._count.children > 0,
          }}
          parents={parents}
        />

        {category._count.children > 0 && (
          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-sans text-[12px] font-medium uppercase tracking-[0.04em] text-fg-muted">
              Subcategorías ({category._count.children})
            </h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/admin/categorias/${child.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-2 font-sans text-[14px] text-fg transition-colors hover:bg-surface-alt"
                  >
                    <span className="truncate">{child.name}</span>
                    <span
                      aria-label={child.isActive ? 'Activa' : 'Inactiva'}
                      className={
                        child.isActive
                          ? 'h-1.5 w-1.5 rounded-full bg-success'
                          : 'h-1.5 w-1.5 rounded-full bg-fg-subtle/60'
                      }
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <DangerZone
          categoryId={category.id}
          productCount={category._count.products}
          childCount={category._count.children}
        />
      </div>
    </>
  );
}
