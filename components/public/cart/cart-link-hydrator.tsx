'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useCart } from '@/components/public/cart-context';
import { decodeCartState, type DecodedCartState } from '@/lib/cart-link';

import { useCustomerInfo } from './customer-info-context';

type Props = { state: string };

/**
 * Reads `?state=...` once on mount, decodes it, and either:
 * - silently hydrates the cart + customer info if the local cart is empty,
 *   or
 * - shows an inline banner asking the user whether to import the link or keep
 *   their existing cart, when there's a conflict.
 *
 * Either way, the `state` query param is removed from the URL so a refresh
 * doesn't re-trigger the flow.
 */
export function CartLinkHydrator({ state }: Props) {
  const cart = useCart();
  const { replaceAll: replaceCustomer } = useCustomerInfo();
  const ranRef = useRef(false);
  const [pending, setPending] = useState<DecodedCartState | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    if (!cart.hydrated) return;
    ranRef.current = true;

    const decoded = decodeCartState(state);
    if (!decoded) {
      toast.error('El link del pedido no es válido');
      cleanUrl();
      return;
    }

    if (cart.items.length === 0) {
      cart.replaceAll(decoded.items);
      replaceCustomer(decoded.customer);
      toast.success('Pedido cargado desde el link');
      cleanUrl();
      return;
    }

    setPending(decoded);
  }, [cart, replaceCustomer, state]);

  if (!pending) return null;

  const itemCount = pending.items.reduce((acc, i) => acc + i.qty, 0);
  const lineCount = pending.items.length;

  const onAccept = () => {
    cart.replaceAll(pending.items);
    replaceCustomer(pending.customer);
    setPending(null);
    cleanUrl();
    toast.success('Pedido cargado');
  };

  const onReject = () => {
    setPending(null);
    cleanUrl();
  };

  return (
    <div className="border-b border-primary/30 bg-primary-soft px-4 py-3">
      <p className="font-sans text-[13px] font-medium text-fg">
        Recibiste un link con un pedido de {itemCount}{' '}
        {itemCount === 1 ? 'producto' : 'productos'}{' '}
        ({lineCount} {lineCount === 1 ? 'artículo' : 'artículos'}).
      </p>
      <p className="mt-0.5 font-sans text-[12px] text-fg-muted">
        Si lo cargas, reemplazará tu carrito actual.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 font-sans text-[13px] font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Cargar pedido
        </button>
        <button
          type="button"
          onClick={onReject}
          className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-bg px-4 font-sans text-[13px] font-medium text-fg hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Mantener el mío
        </button>
      </div>
    </div>
  );
}

function cleanUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('state');
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}
