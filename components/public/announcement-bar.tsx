'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  id: string;
  message: string;
};

const STORAGE_PREFIX = 'amantis.announcement.dismissed:';

export function AnnouncementBar({ id, message }: Props) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDismissed(false);
      return;
    }
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      setDismissed(raw === '1');
    } catch {
      setDismissed(false);
    }
  }, [id]);

  // Don't render anything during SSR / first paint to avoid a flash that the
  // user already dismissed before. The visual is small enough that this is
  // not a CLS concern.
  if (dismissed === null || dismissed) return null;

  const onDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, '1');
    } catch {
      // Best-effort.
    }
  };

  return (
    <div
      className={cn(
        'sticky top-0 z-40 flex items-center gap-2 bg-primary px-4 py-1.5',
        'font-sans text-[12px] text-primary-foreground',
      )}
      role="status"
      aria-live="polite"
    >
      <p className="flex-1 text-center leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar anuncio"
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          'text-primary-foreground/85 transition-colors hover:bg-primary-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30',
        )}
      >
        <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
