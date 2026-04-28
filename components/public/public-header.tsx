'use client';

import { Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

import { useCart } from './cart-context';

export function PublicHeader() {
  const { count, hydrated } = useCart();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border/60 bg-bg/85 backdrop-blur-sm',
        'supports-[backdrop-filter]:bg-bg/70',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <Link
          href="/"
          aria-label="Ámantis · Inicio"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Logo size={20} />
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <IconButton href="/buscar" label="Buscar productos">
            <Search aria-hidden className="h-5 w-5" strokeWidth={1.5} />
          </IconButton>

          <IconButton href="/carrito" label={cartLabel(count)}>
            <span className="relative inline-flex">
              <ShoppingBag aria-hidden className="h-5 w-5" strokeWidth={1.5} />
              {hydrated && count > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center',
                    'rounded-full bg-primary px-1 font-sans text-[10px] font-semibold text-primary-foreground',
                  )}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </span>
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function cartLabel(count: number): string {
  if (count === 0) return 'Tu pedido (vacío)';
  if (count === 1) return 'Tu pedido (1 artículo)';
  return `Tu pedido (${count} artículos)`;
}

function IconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full text-fg',
        'transition-colors duration-base ease-smooth hover:bg-surface-alt',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      {children}
    </Link>
  );
}
