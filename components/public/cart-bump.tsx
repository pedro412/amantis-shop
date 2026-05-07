'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { useCart } from './cart-context';

/**
 * Wraps the ShoppingBag icon (header / bottom-nav / product CTA) and bounces
 * it briefly every time `cart.add()` runs, driven by the `bumpedAt` counter
 * on cart-context. Reduced-motion callers get an opacity flash instead of a
 * scale animation.
 *
 * The first mount uses `bumpedAt === 0` and renders without animating so the
 * page-load doesn't show every cart icon "popping" out of nowhere.
 */
export function CartBump({ children }: { children: React.ReactNode }) {
  const { bumpedAt } = useCart();
  const reduced = useReducedMotion();

  // Suppress animation on the very first mount (bumpedAt = 0). Once it's been
  // bumped at least once, every subsequent change re-mounts via key and plays.
  const animate =
    bumpedAt > 0
      ? reduced
        ? { opacity: [1, 0.55, 1] }
        : { scale: [1, 1.25, 0.95, 1] }
      : { scale: 1 };

  return (
    <motion.span
      key={bumpedAt || 'init'}
      initial={{ scale: 1 }}
      animate={animate}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative inline-flex"
    >
      {children}
    </motion.span>
  );
}

/**
 * Pop animation for the count badge — re-mounts every time `count` changes
 * so the new number scales in from a small/transparent state.
 */
export function CartCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      key={count}
      aria-hidden
      initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={className}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}
