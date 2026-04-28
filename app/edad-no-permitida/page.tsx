import type { Metadata } from 'next';

import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Acceso restringido · Ámantis',
  description: 'Este sitio es solo para mayores de 18 años.',
  robots: { index: false, follow: false },
};

export default function EdadNoPermitidaPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-6 py-16 text-center">
      <Logo size={28} />
      <div className="max-w-sm space-y-4">
        <h1 className="font-serif text-h1 text-fg">
          Este sitio es solo para mayores de 18 años.
        </h1>
        <p className="font-sans text-body leading-relaxed text-fg-muted">
          Gracias por tu visita. Te invitamos a regresar cuando cumplas la edad
          mínima.
        </p>
      </div>
      <p className="font-sans text-[11px] text-fg-subtle">
        Cumplimiento legal · México
      </p>
    </main>
  );
}
