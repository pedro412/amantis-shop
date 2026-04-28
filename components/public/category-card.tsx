import Link from 'next/link';

import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';

type Props = {
  slug: string;
  name: string;
  imageKey: string | null;
  productCount: number;
};

export function CategoryCard({ slug, name, imageKey, productCount }: Props) {
  const src = imageKey ? tryImagePublicUrl(imageKey, 'medium') : null;

  return (
    <Link
      href={`/categoria/${slug}`}
      className={cn(
        'group relative flex aspect-[5/3] w-full overflow-hidden rounded-xl',
        'bg-primary-soft text-fg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      )}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-smooth group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      )}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 transition-opacity duration-base',
          // Always have a soft tint for legibility, deepen if there's an image.
          src
            ? 'bg-gradient-to-t from-fg/55 via-fg/25 to-transparent'
            : 'bg-gradient-to-br from-primary/15 via-primary-soft/70 to-transparent',
        )}
      />
      <div className="relative z-10 flex w-full flex-col justify-end p-3">
        <p
          className={cn(
            'font-serif text-[18px] font-medium leading-tight',
            src ? 'text-fg-inverse' : 'text-primary',
          )}
        >
          {name}
        </p>
        <p
          className={cn(
            'mt-0.5 font-sans text-[11px]',
            src ? 'text-fg-inverse/85' : 'text-fg-muted',
          )}
        >
          {productCount} {productCount === 1 ? 'producto' : 'productos'}
        </p>
      </div>
    </Link>
  );
}
