import { CategoryCard } from '@/components/public/category-card';
import type { HomeCategory } from '@/server/queries/home';

export function CategoriesGrid({ categories }: { categories: HomeCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="px-4 pt-8">
      <SectionHeading title="Explora por categoría" />
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {categories.map((c) => (
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
