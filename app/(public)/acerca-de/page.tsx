import type { Metadata } from 'next';

import {
  StaticPageShell,
  StaticSection,
} from '@/components/public/static-page-shell';

const TITLE = 'Acerca de';
const DESCRIPTION =
  'Ámantis es un catálogo digital pensado para que elegir productos íntimos sea cómodo, discreto y sin presión.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/acerca-de' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/acerca-de',
  },
};

export default function AcercaDePage() {
  return (
    <StaticPageShell
      title="Acerca de Ámantis"
      intro="Un espacio cuidado para elegir productos íntimos sin prisa, sin juicios y con asesoría real."
    >
      <StaticSection title="Quiénes somos">
        <p>
          Ámantis nace en Ciudad del Carmen con la intención de ofrecer
          lencería, accesorios y productos para el bienestar íntimo de adultos
          en un entorno cercano, profesional y libre de prejuicios.
        </p>
        <p>
          Cada producto se selecciona con criterio: marcas reconocidas,
          materiales seguros y opciones para distintos cuerpos y preferencias.
          La idea es que cualquier persona mayor de edad pueda explorar el
          catálogo a su ritmo y pedir asesoría cuando la necesite.
        </p>
      </StaticSection>

      <StaticSection title="Cómo trabajamos">
        <p>
          No tenemos carrito en línea con cobro automático. Tú envías tu pedido
          por WhatsApp y nosotras lo confirmamos contigo: disponibilidad, costo
          de envío, datos para la transferencia y tiempo estimado.
        </p>
        <p>
          Esa decisión es a propósito. Permite resolver dudas sobre tallas,
          variantes o uso del producto antes de pagar, y mantener una atención
          personalizada que un checkout automático no puede dar.
        </p>
      </StaticSection>

      <StaticSection title="Nuestro compromiso">
        <p>
          Discreción en el empaque, respeto en cada conversación y respaldo en
          lo que vendemos. Si algo no llega como esperabas, hablamos contigo
          para resolverlo dentro de lo que la naturaleza íntima del producto
          permite.
        </p>
      </StaticSection>
    </StaticPageShell>
  );
}
