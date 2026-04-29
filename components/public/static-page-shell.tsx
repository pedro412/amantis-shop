import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type Props = {
  title: string;
  intro?: string;
  children: React.ReactNode;
};

/** Shared layout for every static informational page (Acerca, FAQ, etc). */
export function StaticPageShell({ title, intro, children }: Props) {
  return (
    <article className="px-5 pt-2 pb-10">
      <div className="flex items-center gap-3 pb-3">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </div>

      <header className="mt-1">
        <h1 className="font-serif text-[28px] font-medium leading-tight text-fg">
          {title}
        </h1>
        {intro && (
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-fg-muted">
            {intro}
          </p>
        )}
      </header>

      <div className="mt-7 space-y-7 font-sans text-[14px] leading-relaxed text-fg">
        {children}
      </div>
    </article>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export function StaticSection({ title, children }: SectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="font-serif text-[18px] font-medium text-fg">{title}</h2>
      <div className="space-y-2 text-fg-muted">{children}</div>
    </section>
  );
}
