import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span
        aria-hidden
        className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary"
      >
        <ShoppingBag className="h-8 w-8" strokeWidth={1.25} />
      </span>
      <h1 className="font-serif text-h2 font-medium text-fg">
        Tu pedido está vacío
      </h1>
      <p className="mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-fg-muted">
        Explora el catálogo y agrega los productos que te gusten. Cuando estés
        lista, los enviaremos por WhatsApp.
      </p>
      <Button asChild variant="primary" size="lg" className="mt-6">
        <Link href="/">Ver catálogo</Link>
      </Button>
    </div>
  );
}
