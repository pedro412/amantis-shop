'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { useCart } from '@/components/public/cart-context';

import { CartCustomerFields } from './cart-customer-fields';
import { CartEmptyState } from './cart-empty-state';
import { CartItemRow } from './cart-item-row';
import { CartLinkHydrator } from './cart-link-hydrator';
import { CartSummary } from './cart-summary';
import { CustomerInfoProvider } from './customer-info-context';

type Props = {
  /** Optional shared-cart payload from `?state=...`. */
  linkState?: string;
};

export function CartPage({ linkState }: Props) {
  const { items, count, hydrated } = useCart();

  // Loading skeleton — keep the providers off the tree so we don't pay for
  // their effects until we have real data.
  if (!hydrated) return <CartLoading />;

  // Empty state still mounts the link hydrator (in case the inbound link
  // brings the cart back to life). The hydrator silently replaces when the
  // local cart is empty, so the user lands directly on the cart UI on the
  // next render.
  return (
    <CustomerInfoProvider>
      {linkState && <CartLinkHydrator state={linkState} />}

      {items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <>
          <Header itemCount={count} />

          <ul className="flex flex-col divide-y divide-border/60">
            {items.map((item) => (
              <li key={item.lineId}>
                <CartItemRow item={item} />
              </li>
            ))}
          </ul>

          <CartCustomerFields />

          {/* Reserve space for the fixed summary panel so the last item isn't hidden. */}
          <div className="h-56" aria-hidden />

          <CartSummary />
        </>
      )}
    </CustomerInfoProvider>
  );
}

function Header({ itemCount }: { itemCount: number }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-2 pb-3">
      <Link
        href="/"
        aria-label="Volver al inicio"
        className="-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.75} />
      </Link>
      <h1 className="flex-1 truncate font-serif text-[20px] font-medium leading-tight text-fg">
        Tu pedido
      </h1>
      <p className="font-sans text-[12px] tabular-nums text-fg-muted">
        {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
      </p>
    </div>
  );
}

function CartLoading() {
  return (
    <div className="px-4 pt-3" aria-hidden>
      <div className="h-6 w-32 rounded bg-surface-alt" />
      <ul className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="h-[76px] w-[76px] shrink-0 rounded-md bg-surface-alt" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 rounded bg-surface-alt" />
              <div className="h-3 w-1/3 rounded bg-surface-alt" />
              <div className="h-9 w-32 rounded-full bg-surface-alt" />
            </div>
          </li>
        ))}
      </ul>
      <span className="sr-only">Cargando carrito…</span>
    </div>
  );
}
