'use client';

import { useState } from 'react';

import type { InputValidity } from '@/components/ui/input';

/**
 * Drives the validity prop for an Input based on a value + validator.
 *
 * Behavior:
 * - Empty value → 'idle' (no marking until the user types something)
 * - Valid value → 'valid' (green check shows immediately, even pre-blur)
 * - Invalid value → 'invalid' only AFTER the first blur (so the user doesn't
 *   see red while still typing the first characters)
 *
 * Usage:
 * ```tsx
 * const phone = useFieldValidity(info.phone, isPhoneValid);
 * <Input value={info.phone} onChange={...} {...phone} />
 * ```
 */
export function useFieldValidity(
  value: string,
  isValid: (v: string) => boolean,
): { validity: InputValidity; onBlur: () => void } {
  const [touched, setTouched] = useState(false);
  const validity: InputValidity = !value
    ? 'idle'
    : isValid(value)
      ? 'valid'
      : touched
        ? 'invalid'
        : 'idle';
  return { validity, onBlur: () => setTouched(true) };
}
