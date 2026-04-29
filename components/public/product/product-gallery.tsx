'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';

type Props = {
  imageKeys: string[];
  alt: string;
};

export function ProductGallery({ imageKeys, alt }: Props) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Track which slide is currently in view by observing visibility of each
  // slide. Native scroll-snap handles the gesture; this just keeps the dots
  // in sync.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || imageKeys.length <= 1) return;
    const slides = Array.from(scroller.querySelectorAll<HTMLLIElement>('[data-slide]'));
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest visibility ratio.
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best || !best.isIntersecting) return;
        const idx = Number((best.target as HTMLElement).dataset.slide);
        if (Number.isFinite(idx)) setActive(idx);
      },
      { root: scroller, threshold: [0.5, 0.75, 1] },
    );
    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [imageKeys]);

  if (imageKeys.length === 0) {
    return (
      <div
        aria-hidden
        className="flex aspect-[4/5] w-full items-center justify-center bg-primary-soft text-primary/40"
      >
        <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        // touch-action: pan-x is applied here AND inline on every descendant
        // because iOS Safari uses the touch-action of the element under the
        // pointer (the <img>), and touch-action is not inherited. Defense in
        // depth: ul + li + img all opt out of vertical pan capture.
        // overflow-y-hidden makes vertical overflow explicit so iOS doesn't
        // assume the container can also scroll vertically.
        style={{ touchAction: 'pan-x' }}
        className={cn(
          'flex aspect-[4/5] w-full snap-x snap-proximity overflow-x-auto overflow-y-hidden',
          'bg-surface-alt',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {imageKeys.map((key, idx) => {
          const src = tryImagePublicUrl(key, 'full');
          return (
            <li
              key={key}
              data-slide={idx}
              style={{ touchAction: 'pan-x' }}
              className="relative h-full w-full shrink-0 snap-center"
            >
              {src ? (
                <Image
                  src={src}
                  alt={idx === 0 ? alt : ''}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  style={{ touchAction: 'pan-x' }}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/40">
                  <ImageIcon className="h-8 w-8" strokeWidth={1.25} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {imageKeys.length > 1 && (
        <ol
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5"
        >
          {imageKeys.map((key, idx) => {
            const isActive = idx === active;
            return (
              <li
                key={key}
                className={cn(
                  'h-[5px] rounded-full bg-fg-inverse/55 transition-all duration-base ease-smooth',
                  isActive ? 'w-[18px] bg-fg-inverse' : 'w-[5px]',
                )}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
}
