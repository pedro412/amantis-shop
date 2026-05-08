'use client';

import { ImageIcon, Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useCart, type CartItem } from '@/components/public/cart-context';
import { formatMXN } from '@/lib/format';
import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';

const QTY_MAX = 99;

type Props = {
  item: CartItem;
};

export function CartItemRow({ item }: Props) {
  const { setQty, remove } = useCart();
  const src = item.thumbnailKey ? tryImagePublicUrl(item.thumbnailKey, 'thumb') : null;
  const lineTotal = item.unitPrice * item.qty;

  const dec = () => setQty(item.lineId, Math.max(1, item.qty - 1));
  const inc = () => setQty(item.lineId, Math.min(QTY_MAX, item.qty + 1));
  const del = () => remove(item.lineId);

  // Old v1 carts (before slug was tracked) get cleared by the version bump,
  // so in practice item.slug is always present. Guard kept for type safety.
  const productHref = item.slug ? `/producto/${item.slug}` : null;

  return (
    <article className="flex items-start gap-3 px-4 py-4">
      {productHref ? (
        <Link
          href={productHref}
          aria-label={`Ver ${item.name}`}
          className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-md bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="76px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/50"
            >
              <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          )}
        </Link>
      ) : (
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-md bg-surface-alt">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="76px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/50"
            >
              <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {productHref ? (
            <Link
              href={productHref}
              className="min-w-0 flex-1 font-sans text-[14px] font-medium leading-snug text-fg hover:text-primary focus-visible:outline-none focus-visible:underline"
            >
              {item.name}
            </Link>
          ) : (
            <p className="min-w-0 flex-1 font-sans text-[14px] font-medium leading-snug text-fg">
              {item.name}
            </p>
          )}
          <button
            type="button"
            aria-label={`Quitar ${item.name}`}
            onClick={del}
            className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-subtle hover:bg-surface-alt hover:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X aria-hidden className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        {item.variantLabel && (
          <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
            {item.variantLabel}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-bg p-0.5">
            <StepperButton
              ariaLabel="Reducir cantidad"
              disabled={item.qty <= 1}
              onClick={dec}
            >
              <Minus aria-hidden className="h-4 w-4" strokeWidth={2.25} />
            </StepperButton>
            <span
              aria-live="polite"
              className="min-w-[2rem] text-center font-sans text-[13px] font-semibold tabular-nums text-fg"
            >
              {item.qty}
            </span>
            <StepperButton
              ariaLabel="Aumentar cantidad"
              disabled={item.qty >= QTY_MAX}
              onClick={inc}
            >
              <Plus aria-hidden className="h-4 w-4" strokeWidth={2.25} />
            </StepperButton>
          </div>
          <p className="font-sans text-[14px] font-semibold tabular-nums text-fg">
            {formatMXN(lineTotal)}
          </p>
        </div>
      </div>
    </article>
  );
}

function StepperButton({
  children,
  ariaLabel,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-fg',
        'transition-colors duration-base ease-smooth',
        'hover:bg-surface-alt active:scale-[0.96]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}
