import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Native <select> styled to match the brand Input. We deliberately use the
 * platform picker on mobile (iOS sheet, Android drawer) instead of a custom
 * dropdown — better accessibility and ergonomics for short option lists.
 *
 * The chevron is rendered as an absolutely positioned lucide icon (with
 * pointer-events-none) instead of a CSS background-image, because data-URL
 * background images break webpack's css-loader URL resolution.
 */
const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-12 w-full appearance-none rounded-md border border-border bg-bg pl-4 pr-10',
          'font-sans text-body text-fg',
          'transition-colors duration-base ease-smooth',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted"
        strokeWidth={1.75}
      />
    </div>
  ),
);
Select.displayName = 'Select';

export { Select };
