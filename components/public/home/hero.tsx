import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function HomeHero() {
  return (
    <section className="px-4 pt-4">
      <div className="relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[18px] bg-surface-alt">
        {/* Editorial photo. The container is rounded so we let next/image fill
            and rely on object-cover so any aspect ratio fills cleanly. */}
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />

        {/* Dark gradient overlay anchored to the bottom for legible copy on
            top of the photo (per handoff). */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-fg/65 via-fg/25 to-transparent"
        />

        <div className="relative z-10 max-w-[280px] space-y-3 p-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-inverse/85">
            Bienvenida
          </p>
          <h1 className="font-serif text-[32px] font-medium leading-[1.1] text-fg-inverse">
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
