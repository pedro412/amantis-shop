'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { DrawerCategory } from '@/server/queries/categories';

type Props = {
  categories: DrawerCategory[];
  trigger: React.ReactNode;
};

export function CategoriesDrawer({ categories, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[320px] p-0 sm:w-[380px]">
        <div className="border-b border-border px-5 py-4">
          <SheetTitle className="font-serif text-[20px] font-medium text-fg">
            Categorías
          </SheetTitle>
        </div>

        <nav
          aria-label="Navegación de categorías"
          className="overflow-y-auto px-2 py-3"
          style={{ maxHeight: 'calc(100dvh - 73px)' }}
        >
          {categories.length === 0 ? (
            <p className="px-3 py-2 font-sans text-[13px] text-fg-muted">
              Aún no hay categorías visibles.
            </p>
          ) : (
            <ul className="space-y-1">
              {categories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} onNavigate={close} />
              ))}
            </ul>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function CategoryItem({
  category,
  onNavigate,
}: {
  category: DrawerCategory;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={`/categoria/${category.slug}`}
        onClick={onNavigate}
        className={cn(
          'group flex items-center justify-between gap-2 rounded-md px-3 py-2.5',
          'transition-colors hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        )}
      >
        <span className="min-w-0 truncate font-sans text-[15px] font-medium text-fg">
          {category.name}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-sans text-[12px] tabular-nums text-fg-subtle">
          {category.productCount}
          <ChevronRight aria-hidden className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </Link>

      {category.children.length > 0 && (
        <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-border pl-3">
          {category.children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/categoria/${child.slug}`}
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-md px-3 py-2',
                  'font-sans text-[13px] text-fg-muted',
                  'transition-colors hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                )}
              >
                <span className="min-w-0 truncate">{child.name}</span>
                <span className="shrink-0 font-sans text-[11px] tabular-nums text-fg-subtle">
                  {child.productCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
