import type { Metadata } from 'next';
import Link from 'next/link';

import {
  StaticPageShell,
  StaticSection,
} from '@/components/public/static-page-shell';

const TITLE = 'Términos y condiciones';
const DESCRIPTION =
  'Reglas de uso del sitio Ámantis: pedidos por WhatsApp, pagos, envíos, devoluciones por higiene y edad mínima.';
const LAST_UPDATED = '29 de abril de 2026';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/terminos' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/terminos',
  },
};

export default function TerminosPage() {
  return (
    <StaticPageShell
      title="Términos y condiciones"
      intro={`Última actualización: ${LAST_UPDATED}.`}
    >
      <StaticSection title="1. Aceptación de los términos">
        <p>
          Al utilizar este sitio web y los canales de venta de Ámantis (en
          adelante, “Ámantis” o “el Sitio”), aceptas los presentes Términos y
          Condiciones. Si no estás de acuerdo, te pedimos no usar el Sitio ni
          realizar pedidos.
        </p>
      </StaticSection>

      <StaticSection title="2. Edad mínima">
        <p>
          Ámantis comercializa productos para uso íntimo y bienestar adulto.
          Está dirigido exclusivamente a personas mayores de 18 años. Al
          ingresar al Sitio confirmas, bajo protesta de decir verdad, que eres
          mayor de edad conforme a la legislación de tu lugar de residencia.
        </p>
      </StaticSection>

      <StaticSection title="3. Naturaleza del servicio">
        <p>
          Este Sitio funciona como catálogo digital. Los pedidos se concretan a
          través de WhatsApp con personal de Ámantis: el Sitio no procesa
          cobros automáticos ni genera órdenes vinculantes hasta que la compra
          se confirma en la conversación con nosotras.
        </p>
        <p>
          Las imágenes son ilustrativas. La disponibilidad real de cada
          producto se confirma al momento de procesar tu pedido.
        </p>
      </StaticSection>

      <StaticSection title="4. Proceso de compra">
        <p>
          Para realizar una compra, agregas los productos a tu pedido y nos lo
          envías por WhatsApp. Posteriormente confirmamos disponibilidad,
          costo final con envío y datos para la transferencia. La compra se
          considera concretada únicamente al momento en que se recibe el pago
          en la cuenta indicada.
        </p>
      </StaticSection>

      <StaticSection title="5. Pagos">
        <p>
          Aceptamos transferencia bancaria (SPEI). Los datos de la cuenta se
          comparten directamente por WhatsApp tras confirmar tu pedido. No
          aceptamos pagos en este Sitio ni a través de pasarelas externas.
        </p>
        <p>
          Es responsabilidad del cliente verificar que los datos bancarios
          sean los oficiales que Ámantis te haya compartido. No nos hacemos
          responsables por transferencias enviadas a cuentas distintas a las
          confirmadas en la conversación.
        </p>
      </StaticSection>

      <StaticSection title="6. Facturación">
        <p>
          Por el momento Ámantis no emite facturas fiscales (CFDI). En caso de
          requerirse en el futuro, los términos de facturación se publicarán en
          este apartado.
        </p>
      </StaticSection>

      <StaticSection title="7. Envíos">
        <p>
          Realizamos entregas locales en Ciudad del Carmen, Campeche, y envíos
          a otras ciudades a través de la paquetería que se acuerde con el
          cliente. Los costos y tiempos de envío se confirman por WhatsApp
          antes del pago.
        </p>
        <p>
          Una vez entregado el paquete a la paquetería, los tiempos de tránsito
          y la entrega final dependen de dicha empresa. Compartiremos contigo
          la guía para que rastrees tu envío.
        </p>
        <p>
          Todos los paquetes se envían en empaque neutro, sin marca visible ni
          referencia al contenido.
        </p>
      </StaticSection>

      <StaticSection title="8. Devoluciones y cambios">
        <p>
          Por la naturaleza íntima de los productos comercializados y por
          motivos de higiene, no se aceptan devoluciones ni cambios una vez que
          el empaque ha sido abierto.
        </p>
        <p>
          Si recibes un producto dañado, equivocado o con desperfectos de
          fábrica, comunícalo dentro de las 24 horas siguientes a la recepción
          (con fotografías del empaque y del producto) y resolveremos contigo
          la reposición o el reembolso correspondiente.
        </p>
      </StaticSection>

      <StaticSection title="9. Propiedad intelectual">
        <p>
          Todos los contenidos del Sitio (textos, imágenes, marca, logotipos,
          diseño) son propiedad de Ámantis o se utilizan con autorización.
          Queda prohibida su reproducción total o parcial sin consentimiento
          expreso.
        </p>
      </StaticSection>

      <StaticSection title="10. Limitación de responsabilidad">
        <p>
          Ámantis no será responsable por daños indirectos, incidentales o
          consecuentes derivados del uso del Sitio o del uso indebido de los
          productos. La utilización de los productos es responsabilidad del
          cliente, quien declara conocer las indicaciones, advertencias e
          instrucciones de uso de cada artículo.
        </p>
      </StaticSection>

      <StaticSection title="11. Modificaciones">
        <p>
          Estos términos pueden actualizarse en cualquier momento. La versión
          vigente siempre estará publicada en esta página, con la fecha de su
          última actualización.
        </p>
      </StaticSection>

      <StaticSection title="12. Legislación aplicable">
        <p>
          Estos términos se rigen por las leyes vigentes en los Estados Unidos
          Mexicanos. Para cualquier controversia, las partes se someten a la
          jurisdicción de los tribunales competentes en Ciudad del Carmen,
          Campeche, renunciando a cualquier otra jurisdicción que pudiera
          corresponderles.
        </p>
      </StaticSection>

      <StaticSection title="13. Contacto">
        <p>
          Para cualquier duda relacionada con estos términos, escríbenos por
          WhatsApp desde la página de{' '}
          <Link href="/contacto" className="text-primary hover:underline">
            contacto
          </Link>
          .
        </p>
      </StaticSection>

      <p className="rounded-md border border-border/60 bg-surface-alt p-3 font-sans text-[12px] leading-relaxed text-fg-muted">
        Estos términos son una versión adaptada a partir de prácticas comunes
        para el comercio electrónico en México. Su redacción podrá ajustarse
        tras revisión legal específica para Ámantis.
      </p>
    </StaticPageShell>
  );
}
