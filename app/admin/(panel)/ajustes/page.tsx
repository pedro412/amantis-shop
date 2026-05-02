import type { Metadata } from 'next';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { listAnnouncements } from '@/server/queries/announcements';

import { AnnouncementForm } from './announcement-form';
import { AnnouncementsList } from './announcements-list';

export const metadata: Metadata = {
  title: 'Ajustes · Ámantis',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AjustesPage() {
  const session = await auth();
  const announcements = await listAnnouncements();

  return (
    <>
      <AdminHeader
        title="Ajustes"
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? ''}
      />

      <div className="mx-auto max-w-2xl px-5 py-6">
        <section
          aria-labelledby="anuncios-heading"
          className="space-y-4 rounded-lg border border-border bg-surface p-5"
        >
          <header>
            <h2
              id="anuncios-heading"
              className="font-serif text-[18px] font-medium text-fg"
            >
              Anuncios
            </h2>
            <p className="mt-1 font-sans text-[13px] leading-snug text-fg-muted">
              La barra superior del sitio público muestra el anuncio activo.
              Solo puede haber un anuncio activo a la vez. Los clientes pueden
              cerrar el anuncio en su dispositivo (vuelve a aparecer si lo
              cambias por uno nuevo).
            </p>
          </header>

          <AnnouncementForm mode={{ kind: 'create' }} />

          <div className="border-t border-border pt-4">
            <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
              Tus anuncios
            </h3>
            {announcements.length === 0 ? (
              <p className="mt-3 font-sans text-[13px] text-fg-muted">
                Aún no hay anuncios. Crea el primero arriba.
              </p>
            ) : (
              <AnnouncementsList items={announcements} />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
