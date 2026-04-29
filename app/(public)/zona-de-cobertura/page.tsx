import type { Metadata } from 'next';

import {
  StaticPageShell,
  StaticSection,
} from '@/components/public/static-page-shell';
import { Button } from '@/components/ui/button';
import { buildWhatsappUrl } from '@/lib/whatsapp';

const TITLE = 'Zona de cobertura';
const DESCRIPTION =
  'Envíos en Ciudad del Carmen y resto del país por acuerdo. Tiempos y costos se confirman por WhatsApp.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/zona-de-cobertura' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/zona-de-cobertura',
  },
};

export default function ZonaDeCoberturaPage() {
  const href = buildWhatsappUrl(
    'Hola, quiero confirmar costo de envío a mi zona.',
  );

  return (
    <StaticPageShell
      title="Zona de cobertura"
      intro="Operamos desde Ciudad del Carmen, Campeche. Llegamos a otras ciudades por acuerdo con la paquetería que elijas."
    >
      <StaticSection title="Ciudad del Carmen">
        <p>
          Entrega local en 1–2 días hábiles. El costo se calcula según la zona
          dentro de la ciudad y se confirma por WhatsApp antes de pagar.
        </p>
      </StaticSection>

      <StaticSection title="Otras ciudades y estados">
        <p>
          Si vives fuera de Ciudad del Carmen, también te enviamos. Coordinamos
          contigo paquetería (Estafeta, FedEx, DHL u otra), tiempo estimado y
          costo. Todo se acuerda por WhatsApp antes de cobrar.
        </p>
      </StaticSection>

      <StaticSection title="Empaque discreto">
        <p>
          Todos los envíos salen en empaque neutro, sin marca visible ni
          referencia al contenido. Tu privacidad es parte de lo que entregamos.
        </p>
      </StaticSection>

      <div className="pt-2">
        <Button asChild size="lg" variant="primary" className="w-full">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Consultar envío a mi zona
          </a>
        </Button>
      </div>
    </StaticPageShell>
  );
}
