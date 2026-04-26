import type { Metadata } from 'next';

import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Panel · Ámantis',
  robots: { index: false, follow: false },
};

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
  const session = await auth();
  const firstName = session?.user?.name?.split(' ')[0] ?? '';
  const today = new Date();

  return (
    <div className="space-y-6">
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

      <section className="rounded-xl border border-border bg-surface p-5">
        <p className="font-sans text-[13px] leading-relaxed text-fg-muted">
          Aquí verás métricas de tu catálogo, atajos y los últimos productos
          editados. Estamos preparando esa vista — por ahora puedes navegar a
          <span className="font-medium text-fg"> Productos</span>,
          <span className="font-medium text-fg"> Categorías</span> y
          <span className="font-medium text-fg"> Ajustes</span> desde la barra
          inferior.
        </p>
      </section>
    </div>
  );
}
