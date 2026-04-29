import type { Metadata } from 'next';
import Link from 'next/link';

import {
  StaticPageShell,
  StaticSection,
} from '@/components/public/static-page-shell';

const TITLE = 'Aviso de privacidad';
const DESCRIPTION =
  'Cómo Ámantis recolecta, usa y protege tus datos personales conforme a la LFPDPPP en México.';
const LAST_UPDATED = '29 de abril de 2026';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/aviso-de-privacidad' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/aviso-de-privacidad',
  },
};

export default function AvisoDePrivacidadPage() {
  return (
    <StaticPageShell
      title="Aviso de privacidad"
      intro={`Última actualización: ${LAST_UPDATED}.`}
    >
      <StaticSection title="1. Identidad del responsable">
        <p>
          Ámantis (en adelante, el “Responsable”), con operación en Ciudad del
          Carmen, Campeche, México, es responsable del tratamiento de los datos
          personales que recabe a través de este sitio web y de los canales de
          contacto puestos a tu disposición.
        </p>
      </StaticSection>

      <StaticSection title="2. Datos personales que recabamos">
        <p>
          Para coordinar tu pedido y el envío, podemos recabar los siguientes
          datos cuando los proporcionas voluntariamente: nombre, número de
          contacto (WhatsApp / teléfono), zona o domicilio de entrega y datos
          asociados a la transferencia bancaria que realices.
        </p>
        <p>
          No recabamos datos personales sensibles. Tampoco solicitamos
          información que no sea estrictamente necesaria para procesar tu
          pedido.
        </p>
      </StaticSection>

      <StaticSection title="3. Finalidades del tratamiento">
        <p>Tus datos se utilizan para las siguientes finalidades primarias:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Atender, confirmar y dar seguimiento a tu pedido.</li>
          <li>Coordinar la entrega del paquete y comunicarte la guía de envío.</li>
          <li>Resolver dudas, asesorías y cualquier asunto relacionado con la compra.</li>
          <li>Cumplir con obligaciones legales aplicables.</li>
        </ul>
        <p>
          No utilizamos tus datos con fines de mercadotecnia, publicidad ni
          prospección comercial sin tu consentimiento expreso.
        </p>
      </StaticSection>

      <StaticSection title="4. Transferencias de datos">
        <p>
          Para concretar el envío, podemos compartir los datos estrictamente
          necesarios (nombre, dirección, teléfono) con la empresa de
          paquetería que tú elijas o que acordemos. Estas transferencias se
          realizan únicamente para la entrega de tu pedido y no requieren tu
          consentimiento adicional conforme al artículo 37 de la LFPDPPP.
        </p>
        <p>
          No transferimos tus datos personales a terceros con fines comerciales.
        </p>
      </StaticSection>

      <StaticSection title="5. Derechos ARCO">
        <p>
          En cualquier momento puedes ejercer tus derechos de Acceso,
          Rectificación, Cancelación u Oposición (ARCO) respecto del
          tratamiento de tus datos personales, así como revocar el
          consentimiento que nos hayas otorgado.
        </p>
        <p>
          Para hacerlo, escríbenos por WhatsApp desde la página de{' '}
          <Link href="/contacto" className="text-primary hover:underline">
            contacto
          </Link>{' '}
          indicando el derecho que deseas ejercer y los datos sobre los que
          aplica. Te responderemos en un plazo máximo de 20 días hábiles
          conforme a la ley.
        </p>
      </StaticSection>

      <StaticSection title="6. Conservación de los datos">
        <p>
          Tus datos se conservan únicamente por el tiempo necesario para
          cumplir las finalidades antes descritas y las obligaciones legales
          aplicables. Una vez cumplido ese plazo, son eliminados de forma
          segura.
        </p>
      </StaticSection>

      <StaticSection title="7. Cookies y tecnologías similares">
        <p>
          Este sitio utiliza almacenamiento local del navegador (localStorage)
          para recordar el contenido de tu carrito y los datos opcionales que
          nos compartas para agilizar tu pedido (nombre, zona). Esa información
          permanece en tu dispositivo y puedes borrarla en cualquier momento
          desde los ajustes del navegador.
        </p>
      </StaticSection>

      <StaticSection title="8. Modificaciones al aviso">
        <p>
          Este aviso de privacidad puede ser actualizado para reflejar cambios
          legales, operativos o tecnológicos. La versión vigente siempre estará
          publicada en esta página, con la fecha de su última actualización.
        </p>
      </StaticSection>

      <StaticSection title="9. Contacto">
        <p>
          Si tienes preguntas sobre este aviso o sobre el tratamiento de tus
          datos, escríbenos por WhatsApp desde la página de{' '}
          <Link href="/contacto" className="text-primary hover:underline">
            contacto
          </Link>
          .
        </p>
      </StaticSection>

      <p className="rounded-md border border-border/60 bg-surface-alt p-3 font-sans text-[12px] leading-relaxed text-fg-muted">
        Este aviso es una versión adaptada con base en la Ley Federal de
        Protección de Datos Personales en Posesión de los Particulares
        (LFPDPPP). Su redacción podrá ajustarse tras revisión legal específica
        para Ámantis.
      </p>
    </StaticPageShell>
  );
}
