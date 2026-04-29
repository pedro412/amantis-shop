import Link from 'next/link';

import { ProductCard } from '@/components/public/product-card';
import type { HomeProduct } from '@/server/queries/home';

type Props = {
  title: string;
  products: HomeProduct[];
  /** Optional "Ver más" target. Hidden if not provided. */
  seeAllHref?: string;
};

export function ProductsRow({ title, products, seeAllHref }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="pt-8">
      <div className="flex items-baseline justify-between gap-2 px-4">
        <h2 className="font-serif text-[20px] font-medium leading-tight text-fg">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="font-sans text-[12px] font-medium text-primary hover:underline underline-offset-2"
          >
            Ver más
          </Link>
        )}
      </div>
      <ul
        className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Spacer pseudo-items guarantee 16px breathing room at both ends.
            Padding on a horizontal scroll container is unreliable across
            browsers (Safari ignores padding-right; some Android Chromes
            collapse padding-left under flex children). Spacer <li>s sidestep
            the quirk and also give scroll-snap a clean origin to align to. */}
        <li aria-hidden className="w-4 shrink-0" />
        {products.map((p) => (
          <li key={p.id} className="snap-start">
            <ProductCard
              slug={p.slug}
              name={p.name}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              imageKey={p.imageKey}
            />
          </li>
        ))}
        <li aria-hidden className="w-4 shrink-0" />
      </ul>
    </section>
  );
}
