import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function HomeHero() {
  return (
    <section className="px-4 pt-4">
      <div
        className="relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[18px] p-6"
        style={{
          // Editorial gradient placeholder until Shirley supplies the hero photo.
          // Layered radial highlights + brand crimson base for warmth.
          background:
            'radial-gradient(120% 80% at 100% 0%, rgba(245, 230, 224, 0.85) 0%, rgba(245, 230, 224, 0) 55%), radial-gradient(80% 60% at 0% 100%, rgba(122, 14, 32, 0.18) 0%, rgba(122, 14, 32, 0) 60%), linear-gradient(160deg, #FAF6F1 0%, #F2EBE3 60%, #F5E6E0 100%)',
        }}
      >
        {/* Decorative oversized "Á" per handoff. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 select-none font-serif text-[280px] font-medium leading-none text-primary/[0.06]"
        >
          Á
        </span>

        <div className="relative z-10 max-w-[280px] space-y-3">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Bienvenida
          </p>
          <h1 className="font-serif text-[32px] font-medium leading-[1.1] text-fg">
            Un espacio íntimo, discreto y seguro.
          </h1>
          <Button asChild variant="primary" size="md">
            <Link href="/categoria/lenceria">Ver colección</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
