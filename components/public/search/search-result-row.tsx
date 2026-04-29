import { ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { formatMXN } from '@/lib/format';
import { highlightMatches } from '@/lib/highlight';
import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';
import type { SearchHit } from '@/server/queries/search';

type Props = {
  hit: SearchHit;
  query: string;
  /** Called when the row is opened — used to push the query to recents. */
  onOpen?: () => void;
};

export function SearchResultRow({ hit, query, onOpen }: Props) {
  const src = hit.imageKey ? tryImagePublicUrl(hit.imageKey, 'thumb') : null;
  const priceNum = Number(hit.price);

  return (
    <Link
      href={`/producto/${hit.slug}`}
      onClick={onOpen}
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-2',
        'transition-colors duration-base ease-smooth',
        'hover:bg-surface-alt',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-alt">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/50"
          >
            <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-[14px] font-medium text-fg">
          {highlightMatches(hit.name, query)}
        </p>
        <p className="mt-0.5 truncate font-sans text-[11px] text-fg-muted">
          {hit.categoryName}
        </p>
      </div>
      <p className="shrink-0 font-sans text-[13px] font-semibold tabular-nums text-primary">
        {formatMXN(priceNum)}
      </p>
    </Link>
  );
}
