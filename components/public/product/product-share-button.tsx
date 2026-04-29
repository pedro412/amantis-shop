'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

type Props = {
  name: string;
};

export function ProductShareButton({ name }: Props) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy || typeof window === 'undefined') return;
    setBusy(true);
    const url = window.location.href;
    const title = `${name} · Ámantis`;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text: name, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado');
        return;
      }
      toast.error('No pudimos compartir desde este navegador');
    } catch (err) {
      // User cancelled the native share sheet — silent.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('No pudimos compartir, intenta de nuevo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label="Compartir producto"
      onClick={onClick}
      disabled={busy}
      className={cn(
        'absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full',
        'bg-bg/70 text-fg backdrop-blur-sm',
        'transition-colors hover:bg-bg/85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:opacity-60',
      )}
    >
      <Share2 aria-hidden className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}
