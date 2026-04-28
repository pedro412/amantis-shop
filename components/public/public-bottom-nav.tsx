'use client';

import { Home, MessageCircle, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { buildWhatsappUrl } from '@/lib/whatsapp';

import { useCart } from './cart-context';

type Item = {
  href: string;
  label: string;
  Icon: typeof Home;
  /** When true, this is an outbound link (target=_blank, no nav highlighting). */
  external?: boolean;
};

const ITEMS: Item[] = [
  { href: '/', label: 'Inicio', Icon: Home },
  { href: '/buscar', label: 'Buscar', Icon: Search },
  { href: '/carrito', label: 'Pedido', Icon: ShoppingBag },
  { href: buildWhatsappUrl(), label: 'WhatsApp', Icon: MessageCircle, external: true },
];

export function PublicBottomNav() {
  const pathname = usePathname();
  const { count, hydrated } = useCart();

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-bg/95 backdrop-blur-sm',
        'supports-[backdrop-filter]:bg-bg/85',
        // Honor iOS home-indicator inset.
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = !item.external && isActiveRoute(pathname, item.href);
          const showCartBadge =
            item.href === '/carrito' && hydrated && count > 0;

          const content = (
            <span className="relative inline-flex">
              <item.Icon
                aria-hidden
                className="h-5 w-5"
                strokeWidth={active ? 1.8 : 1.5}
              />
              {showCartBadge && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center',
                    'rounded-full bg-primary px-1 font-sans text-[10px] font-semibold text-primary-foreground',
                  )}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </span>
          );

          const className = cn(
            'flex h-14 flex-col items-center justify-center gap-1',
            'font-sans text-[10px] font-medium tracking-[0.02em]',
            'transition-colors duration-base ease-smooth',
            active ? 'text-primary' : 'text-fg-muted hover:text-fg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30',
          );

          return (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.label} (abre en nueva ventana)`}
                  className={className}
                >
                  {content}
                  <span>{item.label}</span>
                </a>
              ) : (
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={
                    item.href === '/carrito' && hydrated
                      ? `${item.label}${count > 0 ? ` · ${count} artículo${count === 1 ? '' : 's'}` : ''}`
                      : item.label
                  }
                  className={className}
                >
                  {content}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
