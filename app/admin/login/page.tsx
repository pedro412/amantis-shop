import type { Metadata } from 'next';

import { Logo } from '@/components/logo';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Acceder · Ámantis',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
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
          Hola.
        </h1>
        <p className="mt-2.5 font-sans text-[15px] leading-[1.55] text-fg-muted">
          Inicia sesión para gestionar tu catálogo.
        </p>
      </section>

      <LoginForm />
    </main>
  );
}
