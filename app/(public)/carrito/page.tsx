import type { Metadata } from 'next';

import { CartPage } from '@/components/public/cart/cart-page';

export const metadata: Metadata = {
  title: 'Tu pedido · Ámantis',
  description: 'Revisa tu pedido y envíalo por WhatsApp.',
  // Cart is per-user state; no SEO value.
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: { state?: string };
};

export default function CarritoPage({ searchParams }: Props) {
  return <CartPage linkState={searchParams.state} />;
}
