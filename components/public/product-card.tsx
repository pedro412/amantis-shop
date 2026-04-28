import { ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { formatMXN } from '@/lib/format';
import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';

type Props = {
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string | null;
  imageKey: string | null;
  /** Card width via Tailwind. Default sized for horizontal scroll rows. */
  className?: string;
};

export function ProductCard({
  slug,
  name,
  price,
  compareAtPrice,
  imageKey,
  className,
}: Props) {
  const src = imageKey ? tryImagePublicUrl(imageKey, 'thumb') : null;
  const priceNum = Number(price);
  const compareNum = compareAtPrice ? Number(compareAtPrice) : null;
  const onSale = compareNum !== null && compareNum > priceNum;

  return (
    <Link
      href={`/producto/${slug}`}
      className={cn(
        'group block w-40 shrink-0',
        'focus-visible:outline-none',
        className,
      )}
    >
      <div
        className={cn(
          'relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-alt',
          'transition-shadow duration-base ease-smooth',
          'group-focus-visible:ring-2 group-focus-visible:ring-primary/30 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-bg',
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/50"
          >
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 font-sans text-[13px] font-medium leading-snug text-fg">
        {name}
      </p>
      <p className="mt-0.5 font-sans text-[13px] tabular-nums">
        <span className="font-semibold text-primary">{formatMXN(priceNum)}</span>
        {onSale && (
          <span className="ml-1.5 text-[11px] text-fg-subtle line-through">
            {formatMXN(compareNum)}
          </span>
        )}
      </p>
    </Link>
  );
}
