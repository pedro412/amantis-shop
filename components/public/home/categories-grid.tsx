import { LayoutGrid } from 'lucide-react';

import { CategoriesDrawer } from '@/components/public/categories-drawer';
import { CategoryCard } from '@/components/public/category-card';
import type { DrawerCategory } from '@/server/queries/categories';
import type { HomeCategory } from '@/server/queries/home';

const HOME_LIMIT = 6;

type Props = {
  categories: HomeCategory[];
  /** Full set used by the drawer when the grid is capped. */
  allCategories: DrawerCategory[];
};

export function CategoriesGrid({ categories, allCategories }: Props) {
  if (categories.length === 0) return null;

  const visible = categories.slice(0, HOME_LIMIT);
  const showSeeAll = categories.length > HOME_LIMIT;

  return (
    <section className="px-4 pt-8">
      <SectionHeading title="Explora por categoría" />
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {visible.map((c) => (
          <li key={c.id}>
            <CategoryCard
              slug={c.slug}
              name={c.name}
              imageKey={c.imageKey}
              productCount={c.productCount}
            />
          </li>
        ))}
      </ul>

      {showSeeAll && (
        <div className="mt-3">
          <CategoriesDrawer
            categories={allCategories}
            trigger={
              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary text-primary font-sans text-[13px] font-medium transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <LayoutGrid aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                Ver todas las categorías
              </button>
            }
          />
        </div>
      )}
    </section>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="font-serif text-[20px] font-medium leading-tight text-fg">
      {title}
    </h2>
  );
}
