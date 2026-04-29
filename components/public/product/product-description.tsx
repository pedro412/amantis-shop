'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  text: string;
};

export function ProductDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Only show the toggle if the collapsed text is actually overflowing —
  // short descriptions don't need a "Ver más" affordance.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setShowToggle(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <section className="px-5 pt-7">
      <h2 className="font-serif text-[16px] font-medium text-fg">Descripción</h2>
      <p
        ref={textRef}
        className={cn(
          'mt-2 whitespace-pre-line font-sans text-[14px] leading-relaxed text-fg-muted',
          !expanded && 'line-clamp-4',
        )}
      >
        {text}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className={cn(
            'mt-2 inline-flex items-center gap-1 font-sans text-[13px] font-medium text-primary',
            'transition-colors hover:underline underline-offset-2',
          )}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
          <ChevronDown
            aria-hidden
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-base ease-smooth',
              expanded && 'rotate-180',
            )}
            strokeWidth={2}
          />
        </button>
      )}
    </section>
  );
}
