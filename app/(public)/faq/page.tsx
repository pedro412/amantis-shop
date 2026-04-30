import type { Metadata } from 'next';

import { StaticPageShell } from '@/components/public/static-page-shell';

export const dynamic = 'force-static';

const TITLE = 'Preguntas frecuentes';
const DESCRIPTION =
  'Resolvemos las dudas más comunes sobre envío, pago, devoluciones, discreción y edad mínima.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/faq',
  },
};

const FAQS = [
  {
    q: '¿Cómo se hace el pedido?',
    a: 'Eliges los productos en el catálogo, los agregas a tu pedido y pulsas el botón “Enviar pedido por WhatsApp”. El mensaje se llena solo con tu lista; tú únicamente lo envías.',
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Tres opciones: efectivo (solo entrega local en Ciudad del Carmen), transferencia bancaria por SPEI, o tarjeta de crédito/débito vía link de pago que te enviamos por WhatsApp. Con tarjeta de crédito participante puedes pagar a 3 meses sin intereses en compras desde $1,500.',
  },
  {
    q: '¿Cuánto tarda mi envío?',
    a: 'En Ciudad del Carmen entregamos en 1–2 días hábiles. Fuera de la ciudad coordinamos paquetería y tiempo estimado en la conversación.',
  },
  {
    q: '¿El paquete llega discreto?',
    a: 'Sí. Enviamos en empaque neutro, sin marca visible ni referencia al contenido. Nadie alrededor sabe qué hay adentro.',
  },
  {
    q: '¿Aceptan devoluciones?',
    a: 'Por la naturaleza íntima de los productos, no aplican devoluciones una vez abierto el empaque por motivos de higiene. Si recibes algo dañado o equivocado, escríbenos en las primeras 24 horas y resolvemos contigo.',
  },
  {
    q: '¿Hay una edad mínima para comprar?',
    a: 'Sí. Ámantis es exclusivamente para personas mayores de 18 años. Por eso al entrar al sitio se solicita confirmar la edad.',
  },
  {
    q: '¿Mis datos son confidenciales?',
    a: 'Solo usamos tus datos para coordinar tu pedido y la entrega. No los compartimos con terceros fuera de la paquetería que envía tu paquete. Más detalle en el aviso de privacidad.',
  },
  {
    q: '¿Puedo pedir asesoría antes de comprar?',
    a: 'Por supuesto. Por WhatsApp puedes preguntarnos sobre tallas, materiales, variantes o uso de cualquier producto antes de pagar.',
  },
] as const;

export default function FaqPage() {
  return (
    <StaticPageShell
      title="Preguntas frecuentes"
      intro="Si tu duda no aparece aquí, escríbenos por WhatsApp y resolvemos contigo."
    >
      <ul className="space-y-6">
        {FAQS.map((item) => (
          <li key={item.q} className="space-y-2">
            <h2 className="font-serif text-[17px] font-medium text-fg">
              {item.q}
            </h2>
            <p className="text-fg-muted">{item.a}</p>
          </li>
        ))}
      </ul>
    </StaticPageShell>
  );
}
