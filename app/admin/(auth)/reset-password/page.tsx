import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/logo';

import { ResetForm } from './reset-form';

export const metadata: Metadata = {
  title: 'Nueva contraseña · Ámantis',
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: { token?: string };
};

export default function ResetPasswordPage({ searchParams }: Props) {
  const token = searchParams.token?.trim();

  return (
    <main className="flex min-h-dvh flex-col bg-surface px-7 pb-8 pt-8">
      <header className="mt-5 flex items-center gap-2">
        <Logo size={20} />
        <span aria-hidden className="h-[14px] w-px bg-border" />
        <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          Panel
        </span>
      </header>

      <section className="mt-16">
        <h1 className="font-serif text-[32px] font-medium leading-[1.1] tracking-[-0.01em] text-fg">
          {token ? 'Crea tu nueva contraseña' : 'Enlace inválido'}
        </h1>
        <p className="mt-2.5 font-sans text-[15px] leading-[1.55] text-fg-muted">
          {token
            ? 'Elige una contraseña segura. Se aplicará de inmediato a tu cuenta.'
            : 'El enlace está incompleto. Solicita uno nuevo desde la pantalla de inicio.'}
        </p>
      </section>

      {token ? (
        <ResetForm token={token} />
      ) : (
        <div className="mt-auto pt-10">
          <Link
            href="/admin/forgot-password"
            className="block w-full rounded-full bg-primary py-3.5 text-center font-sans text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Solicitar enlace
          </Link>
        </div>
      )}
    </main>
  );
}
