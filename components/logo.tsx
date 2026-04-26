import { cn } from '@/lib/utils';

type LogoProps = {
  /** Crimson by default; pass "inverse" for cream-on-dark contexts. */
  tone?: 'primary' | 'inverse';
  /** Approx font size in px (height of the wordmark). */
  size?: number;
  className?: string;
};

/**
 * Brand wordmark. Typeset in Cormorant Garamond per design handoff.
 * The PNG asset (public/logo-amantis.png) is the canonical brand mark for
 * non-text contexts (favicon, OG image) — use this component for in-page UI.
 */
export function Logo({ tone = 'primary', size = 22, className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-block font-serif font-medium leading-none tracking-[0.04em]',
        tone === 'primary' ? 'text-primary' : 'text-fg-inverse',
        className,
      )}
      style={{ fontSize: size * 1.05 }}
      aria-label="Ámantis"
    >
      ÁMANTIS
    </span>
  );
}
