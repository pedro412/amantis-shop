import * as React from 'react';

import { cn } from '@/lib/utils';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block font-sans text-[12px] font-medium tracking-[0.04em] text-fg-muted',
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Label };
