import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function ProductoNotFound() {
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="max-w-sm space-y-3">
        <h1 className="font-serif text-h2 font-medium text-fg">
          Producto no encontrado
        </h1>
        <p className="font-sans text-body text-fg-muted">
          Es posible que ya no esté disponible o el enlace haya cambiado.
        </p>
      </div>
      <Button asChild variant="primary" size="md">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </section>
  );
}
