import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { prisma } from '@/server/lib/prisma';
import {
  activeProductsWhere,
  lowStockProductsWhere,
  noImageProductsWhere,
  orphanCategoryProductsWhere,
} from '@/server/lib/product-filters';

import { DashboardCards } from './dashboard-cards';

export const metadata: Metadata = {
  title: 'Panel · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const greetingFor = (date: Date): string => {
  const hour = date.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const formatToday = (date: Date): string =>
  new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date);

export default async function AdminDashboardPage() {
  const today = new Date();

  const [
    session,
    totalCatalog,
    activeCount,
    lowStockCount,
    noImageCount,
    orphanCategoryCount,
  ] = await Promise.all([
    auth(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: activeProductsWhere }),
    prisma.product.count({ where: lowStockProductsWhere }),
    prisma.product.count({ where: noImageProductsWhere }),
    prisma.product.count({ where: orphanCategoryProductsWhere }),
  ]);

  const firstName = session?.user?.name?.split(' ')[0] ?? '';

  return (
    <>
      <AdminHeader
        title="Panel"
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? ''}
      />
      <div className="space-y-6 px-5 py-5">
        <section>
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Hoy · {formatToday(today)}
          </p>
          <h2 className="mt-1 font-serif text-[28px] font-medium leading-[1.1] text-fg">
            {greetingFor(today)},
            {firstName ? <br /> : ' '}
            {firstName ? `${firstName}.` : 'bienvenida.'}
          </h2>
        </section>

        {totalCatalog === 0 ? (
          <EmptyCatalog />
        ) : (
          <DashboardCards
            activeCount={activeCount}
            lowStockCount={lowStockCount}
            noImageCount={noImageCount}
            orphanCategoryCount={orphanCategoryCount}
          />
        )}
      </div>
    </>
  );
}

function EmptyCatalog() {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h3 className="font-serif text-h3 font-medium text-fg">
        Empieza por tu primer producto
      </h3>
      <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-fg-muted">
        Cuando cargues productos verás aquí su resumen: cuántos están activos,
        cuáles necesitan más fotos y los que tienen stock bajo.
      </p>
      <Button asChild size="lg" className="mt-4">
        <Link href="/admin/productos/nuevo">
          <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
          Crear producto
        </Link>
      </Button>
    </section>
  );
}
