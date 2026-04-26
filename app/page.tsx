import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <Logo size={36} />
      <div className="max-w-md space-y-4">
        <p className="eyebrow text-fg-muted">Próximamente</p>
        <h1 className="font-serif text-h1 text-fg">Un espacio íntimo, discreto y seguro.</h1>
        <p className="text-body text-fg-muted">
          Estamos preparando el catálogo. Mientras tanto, los pedidos siguen siendo por WhatsApp.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/proto/design-system">Sistema de diseño (interno)</Link>
      </Button>
    </main>
  );
}
