import type { Metadata } from 'next';

import { CartPage } from '@/components/public/cart/cart-page';

export const metadata: Metadata = {
  title: 'Tu pedido · A’Mantis',
  description: 'Revisa tu pedido y envíalo por WhatsApp.',
  robots: { index: false, follow: false },
};

type Props = {
  params: { encoded: string };
};

// Path-segment variant of /carrito so messaging-app linkifiers don't truncate
// the base64url payload at `?` / `=`. After hydration, the URL is rewritten
// back to /carrito so a refresh doesn't re-trigger the import flow.
export default function SharedCartPage({ params }: Props) {
  return <CartPage linkState={params.encoded} />;
}
