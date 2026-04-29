'use server';

import { type SearchHit, searchProducts } from '@/server/queries/search';

export type SearchResult =
  | { ok: true; hits: SearchHit[] }
  | { error: string };

export async function searchProductsAction(q: string): Promise<SearchResult> {
  if (typeof q !== 'string') return { error: 'Consulta inválida.' };
  try {
    const hits = await searchProducts(q);
    return { ok: true, hits };
  } catch (err) {
    console.error('[searchProductsAction] failed', err);
    return { error: 'No pudimos buscar. Intenta de nuevo.' };
  }
}
