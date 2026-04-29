'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

export function ProductBackButton() {
  const router = useRouter();

  const onClick = () => {
    // Prefer history back so users return to the same scroll position on the
    // listing/home; fall back to the home if there's nothing to go back to.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      type="button"
      aria-label="Volver"
      onClick={onClick}
      className={cn(
        'absolute left-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full',
        'bg-bg/70 text-fg backdrop-blur-sm',
        'transition-colors hover:bg-bg/85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}
