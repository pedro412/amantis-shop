'use client';

import { Home, Package, Settings, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'Panel', Icon: Home, match: 'exact' },
  { href: '/admin/productos', label: 'Productos', Icon: Package, match: 'prefix' },
  { href: '/admin/categorias', label: 'Categorías', Icon: Tag, match: 'prefix' },
  { href: '/admin/ajustes', label: 'Ajustes', Icon: Settings, match: 'prefix' },
] as const;

export function AdminTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 h-[72px] pb-1',
        'border-t border-border bg-bg/95 backdrop-blur',
        'supports-[backdrop-filter]:bg-bg/85',
      )}
    >
      <ul className="flex h-full">
        {items.map(({ href, label, Icon, match }) => {
          const active =
            match === 'exact'
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1',
                  'font-sans text-[10px] font-medium tracking-[0.04em]',
                  'transition-colors duration-base ease-smooth',
                  active ? 'text-primary' : 'text-fg-muted hover:text-fg',
                )}
              >
                <Icon
                  aria-hidden
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 1.8 : 1.5}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
