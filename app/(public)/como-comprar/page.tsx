import type { Metadata } from 'next';
import Link from 'next/link';

import {
  StaticPageShell,
  StaticSection,
} from '@/components/public/static-page-shell';
import { Button } from '@/components/ui/button';
import { buildWhatsappUrl } from '@/lib/whatsapp';

const TITLE = 'Cómo comprar';
const DESCRIPTION =
  'Cinco pasos para hacer tu pedido en Ámantis: desde explorar el catálogo hasta recibir tu paquete discreto.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/como-comprar' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/como-comprar',
  },
};

const STEPS = [
  {
    n: 1,
    title: 'Explora el catálogo',
    body: 'Navega por categorías o usa la búsqueda. Toca un producto para ver detalles, variantes y disponibilidad.',
  },
  {
    n: 2,
    title: 'Agrega al pedido',
    body: 'Selecciona la variante que te interese y pulsa el botón de agregar al pedido. Puedes seguir comprando y revisar el carrito cuando estés lista.',
  },
  {
    n: 3,
    title: 'Envía tu pedido por WhatsApp',
    body: 'Desde el carrito, pulsa “Enviar pedido por WhatsApp”. Se abre un chat con tu lista pre-llenada. Solo lo envías.',
  },
  {
    n: 4,
    title: 'Confirmamos contigo',
    body: 'Te respondemos por WhatsApp para confirmar disponibilidad, costo de envío según tu zona y datos para la transferencia bancaria.',
  },
  {
    n: 5,
    title: 'Pago y envío discreto',
    body: 'Una vez recibido el pago, preparamos tu pedido y lo enviamos en empaque neutro. Te compartimos guía para que rastrees tu paquete.',
  },
] as const;

export default function ComoComprarPage() {
  const href = buildWhatsappUrl();

  return (
    <StaticPageShell
      title="Cómo comprar"
      intro="Comprar en Ámantis es directo: tú armas tu pedido, lo envías por WhatsApp y nosotras coordinamos el resto contigo."
    >
      <ol className="space-y-5">
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-4">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-serif text-[15px] font-semibold text-primary">
              {step.n}
            </span>
            <div className="flex-1">
              <h2 className="font-sans text-[15px] font-semibold text-fg">
                {step.title}
              </h2>
              <p className="mt-1 text-fg-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <StaticSection title="Pago">
        <p>
          Aceptamos transferencia bancaria. Te compartimos los datos por
          WhatsApp una vez confirmado tu pedido y el costo final con envío.
        </p>
      </StaticSection>

      <StaticSection title="Tiempos de envío">
        <p>
          En Ciudad del Carmen entregamos en 1–2 días hábiles. Para otras
          ciudades del país acordamos paquetería y tiempo en la conversación.
        </p>
      </StaticSection>

      <div className="pt-2">
        <Button asChild size="lg" variant="primary" className="w-full">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Iniciar pedido por WhatsApp
          </a>
        </Button>
        <p className="mt-3 text-center font-sans text-[12px] text-fg-muted">
          ¿Quieres ver el catálogo primero?{' '}
          <Link href="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </StaticPageShell>
  );
}
