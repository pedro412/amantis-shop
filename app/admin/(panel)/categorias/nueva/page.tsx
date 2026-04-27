import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';

import { CategoryForm } from '../category-form';

export const metadata: Metadata = {
  title: 'Nueva categoría · Ámantis',
  robots: { index: false, follow: false },
};

export default async function NuevaCategoriaPage() {
  const session = await auth();

  return (
    <>
      <AdminHeader
        title="Nueva categoría"
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
      <div className="px-5 py-5">
        <CategoryForm mode={{ kind: 'create' }} />
      </div>
    </>
  );
}
