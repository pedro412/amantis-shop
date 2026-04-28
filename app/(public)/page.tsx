import { Button } from '@/components/ui/button';
import { buildWhatsappUrl } from '@/lib/whatsapp';

export default function Home() {
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="max-w-md space-y-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          Próximamente
        </p>
        <h1 className="font-serif text-h1 text-fg">
          Un espacio íntimo, discreto y seguro.
        </h1>
        <p className="font-sans text-body text-fg-muted">
          Estamos preparando el catálogo. Mientras tanto, los pedidos siguen
          siendo por WhatsApp.
        </p>
      </div>
      <Button asChild variant="primary" size="lg">
        <a href={buildWhatsappUrl('Hola Shirley, me gustaría preguntar por un producto.')} target="_blank" rel="noopener noreferrer">
          Escribir por WhatsApp
        </a>
      </Button>
    </section>
  );
}
