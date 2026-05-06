import type { Metadata } from 'next';

import { CartPage } from '@/components/public/cart/cart-page';

export const metadata: Metadata = {
  title: 'Tu pedido · Ámantis',
  description: 'Revisa tu pedido y envíalo por WhatsApp.',
  // Cart links carry per-user payloads; never index.
  robots: { index: false, follow: false },
};

type Props = {
  params: { encoded: string };
};

// Path-segment variant of /carrito?state=… — kept as a separate route so
// chat-app autolinkers don't truncate the base64url payload mid-URL.
export default function CarritoCompartidoPage({ params }: Props) {
  return <CartPage linkState={params.encoded} />;
}
