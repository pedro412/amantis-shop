import type { Metadata } from 'next';

import { UploadTestClient } from './upload-test-client';

export const metadata: Metadata = {
  title: 'Upload test · Ámantis',
  robots: { index: false, follow: false },
};

export default function UploadTestPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 bg-bg px-5 py-10">
      <header>
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          Proto · LIT-150
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-tight text-fg">
          ImageUpload sandbox
        </h1>
        <p className="mt-2 font-sans text-[14px] leading-relaxed text-fg-muted">
          Pruebas el componente reutilizable contra R2 en vivo. Necesitas
          haber iniciado sesión como admin (la acción está protegida).
        </p>
      </header>

      <UploadTestClient />
    </main>
  );
}
