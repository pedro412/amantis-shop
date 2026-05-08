import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputValidity = 'idle' | 'valid' | 'invalid';

export interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Drives the visual feedback ring around the input:
   * - 'idle' (default): neutral border, no icon
   * - 'valid': green border + check icon (positive reinforcement while typing)
   * - 'invalid': red border + aria-invalid (caller delays this until first
   *   blur so the user doesn't see red mid-typing)
   */
  validity?: InputValidity;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, validity = 'idle', ...props }, ref) => {
    const isValid = validity === 'valid';
    const isInvalid =
      validity === 'invalid' ||
      props['aria-invalid'] === true ||
      props['aria-invalid'] === 'true';

    return (
      <div className="relative">
        <input
          type={type}
          ref={ref}
          aria-invalid={isInvalid || undefined}
          className={cn(
            'flex h-12 w-full rounded-md border bg-bg px-4',
            'font-sans text-body text-fg placeholder:text-fg-subtle',
            'transition-colors duration-base ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            isValid &&
              'border-success pr-11 focus-visible:border-success focus-visible:ring-success/20',
            isInvalid &&
              'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            !isValid &&
              !isInvalid &&
              'border-border focus-visible:border-primary focus-visible:ring-primary/20',
            className,
          )}
          {...props}
        />
        {isValid && (
          <Check
            aria-hidden
            strokeWidth={2.25}
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-success"
          />
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
