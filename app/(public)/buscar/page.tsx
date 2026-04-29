import type { Metadata } from 'next';

import { SearchPage } from '@/components/public/search/search-page';

export const metadata: Metadata = {
  title: 'Buscar · Ámantis',
  description: 'Busca productos del catálogo por nombre, descripción o etiqueta.',
  // Search is a utility, not a content page — keep it out of the index.
  robots: { index: false, follow: false },
};

export default function BuscarPage() {
  return <SearchPage />;
}
