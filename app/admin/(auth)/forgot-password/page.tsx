import type { Metadata } from 'next';

import { Logo } from '@/components/logo';

import { ForgotForm } from './forgot-form';

export const metadata: Metadata = {
  title: 'Recuperar contraseña · Ámantis',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
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
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="mt-2.5 font-sans text-[15px] leading-[1.55] text-fg-muted">
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear
          una nueva.
        </p>
      </section>

      <ForgotForm />
    </main>
  );
}
