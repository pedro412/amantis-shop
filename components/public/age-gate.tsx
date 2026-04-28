'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  AGE_COOKIE,
  AGE_MAX_AGE_SECONDS,
  AGE_STORAGE_KEY,
  AGE_VALUE,
} from '@/lib/age-gate';

const HEADING_ID = 'age-gate-heading';
const DESC_ID = 'age-gate-desc';

export function AgeGate() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while open + focus the affirmative button on mount.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    yesButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Block Escape — the gate must be cleared via the buttons, not dismissed.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [open]);

  const handleYes = () => {
    document.cookie = `${AGE_COOKIE}=${AGE_VALUE}; max-age=${AGE_MAX_AGE_SECONDS}; path=/; samesite=lax`;
    try {
      window.localStorage.setItem(AGE_STORAGE_KEY, AGE_VALUE);
    } catch {
      // Quota / private mode — cookie alone is sufficient.
    }
    setOpen(false);
  };

  const handleNo = () => {
    setOpen(false);
    router.push('/edad-no-permitida');
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={HEADING_ID}
      aria-describedby={DESC_ID}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-6 py-10"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <Logo size={28} />

        <div className="space-y-3">
          <h1
            id={HEADING_ID}
            className="font-serif text-[26px] font-medium leading-[1.15] text-fg"
          >
            ¿Eres mayor de 18 años?
          </h1>
          <p id={DESC_ID} className="font-sans text-body leading-relaxed text-fg-muted">
            Este sitio contiene productos para adultos. Necesitamos confirmar
            tu mayoría de edad antes de continuar.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <Button
            ref={yesButtonRef}
            type="button"
            size="lg"
            variant="primary"
            className="w-full"
            onClick={handleYes}
          >
            Sí, soy mayor de 18
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={handleNo}
          >
            No
          </Button>
        </div>

        <p className="font-sans text-[11px] leading-relaxed text-fg-subtle">
          Recordaremos tu respuesta durante un año. Cumplimiento legal · México.
        </p>
      </div>
    </div>
  );
}
