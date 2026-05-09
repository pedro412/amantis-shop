'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { CategoryCard } from '@/components/public/category-card';
import type { HomeCategory } from '@/server/queries/home';

const HOME_LIMIT = 6;

type Props = {
  categories: HomeCategory[];
};

export function CategoriesGrid({ categories }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  const showToggle = categories.length > HOME_LIMIT;
  const visible = expanded ? categories : categories.slice(0, HOME_LIMIT);

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

      {showToggle && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary text-primary font-sans text-[13px] font-medium transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {expanded ? (
              <ChevronUp aria-hidden className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <ChevronDown aria-hidden className="h-4 w-4" strokeWidth={1.75} />
            )}
            {expanded ? 'Ver menos' : 'Ver todas las categorías'}
          </button>
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
