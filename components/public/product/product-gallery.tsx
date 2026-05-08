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

// Pixels of total movement before we decide which axis the gesture belongs to.
// Small enough to feel responsive, big enough that an unintended jitter doesn't
// lock the user into one direction.
const AXIS_LOCK_PX = 10;
// Minimum horizontal travel (or 18% of slide width, whichever is smaller) to
// commit to advancing/retreating one slide on touchend.
const SWIPE_THRESHOLD_PX = 50;
const SWIPE_THRESHOLD_FRACTION = 0.18;

export function ProductGallery({ imageKeys, alt }: Props) {
  const [active, setActive] = useState(0);
  // Live touch offset in px while the user is dragging horizontally. We render
  // the transform from this so the gallery follows the finger; on release we
  // reset to 0 and (maybe) advance the slide index.
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const last = Math.max(0, imageKeys.length - 1);

  // Mirror state in refs so the native event listeners (registered once per
  // imageKeys change) always see fresh values without re-binding listeners.
  const activeRef = useRef(active);
  const dragRef = useRef(drag);
  activeRef.current = active;
  dragRef.current = drag;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || imageKeys.length <= 1) return;

    let startX = 0;
    let startY = 0;
    let width = 0;
    let lock: 'h' | 'v' | null = null;

    const onStart = (ev: TouchEvent) => {
      const t = ev.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
      width = el.clientWidth;
      lock = null;
      setIsDragging(true);
    };

    const onMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (lock === null) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) > AXIS_LOCK_PX) {
          // Decide once: if the user moved more horizontally than vertically,
          // we own the gesture; otherwise we let the page scroll naturally.
          lock = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        }
      }

      if (lock === 'h') {
        // Block native scroll/page pan only after we've claimed the gesture.
        // touchmove must be registered with passive:false for preventDefault
        // to take effect on iOS.
        ev.preventDefault();
        let offset = dx;
        // Rubber-band resistance at the edges so users get tactile feedback
        // that they've reached the start/end without a hard wall.
        const idx = activeRef.current;
        if (idx === 0 && offset > 0) offset = offset * 0.3;
        if (idx === last && offset < 0) offset = offset * 0.3;
        setDrag(offset);
      }
    };

    const onEnd = () => {
      if (lock === 'h') {
        const finalDrag = dragRef.current;
        const threshold = Math.min(SWIPE_THRESHOLD_PX, width * SWIPE_THRESHOLD_FRACTION);
        if (finalDrag < -threshold && activeRef.current < last) {
          setActive((v) => Math.min(last, v + 1));
        } else if (finalDrag > threshold && activeRef.current > 0) {
          setActive((v) => Math.max(0, v - 1));
        }
      }
      setDrag(0);
      setIsDragging(false);
      lock = null;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [imageKeys.length, last]);

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

  // Single-image case: no gesture handling needed.
  if (imageKeys.length === 1) {
    const src = tryImagePublicUrl(imageKeys[0]!, 'full');
    return (
      <div className="relative aspect-[4/5] w-full bg-surface-alt">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/40"
          >
            <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full overflow-hidden bg-surface-alt"
    >
      <ul
        className={cn(
          'flex h-full w-full',
          // Smooth release / index change. While dragging we drop the
          // transition so the gallery tracks the finger 1:1.
          !isDragging && 'transition-transform duration-base ease-smooth',
        )}
        style={{
          transform: `translate3d(calc(${-active * 100}% + ${drag}px), 0, 0)`,
        }}
      >
        {imageKeys.map((key, idx) => {
          const src = tryImagePublicUrl(key, 'full');
          return (
            <li
              key={key}
              className="relative h-full w-full shrink-0"
              aria-hidden={idx !== active}
            >
              {src ? (
                <Image
                  src={src}
                  alt={idx === 0 ? alt : ''}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className="object-cover"
                  unoptimized
                  draggable={false}
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
    </div>
  );
}
