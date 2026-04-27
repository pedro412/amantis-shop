import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Native <select> styled to match the brand Input. We deliberately use the
 * platform picker on mobile (iOS sheet, Android drawer) instead of a custom
 * dropdown — better accessibility and ergonomics for short option lists.
 */
const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-12 w-full appearance-none rounded-md border border-border bg-bg pl-4 pr-10',
        'font-sans text-body text-fg',
        'transition-colors duration-base ease-smooth',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Inline chevron via SVG background — survives appearance:none across browsers.
        "bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%236B5F58'%20stroke-width='1.75'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpolyline%20points='6%209%2012%2015%2018%209'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export { Select };
