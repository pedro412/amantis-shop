import { MapPin, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

import { StaticPageShell } from '@/components/public/static-page-shell';
import { buildWhatsappUrl, getWhatsappDisplayNumber } from '@/lib/whatsapp';

// Lucide dropped brand glyphs in v1.x; inline these so we don't pull a second
// icon package just for two channels.
function InstagramGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FacebookGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const TITLE = 'Contacto';
const DESCRIPTION =
  'Habla con nosotras por WhatsApp, Instagram o Facebook. Asesoría personalizada antes y después de tu pedido.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/contacto' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/contacto',
  },
};

export default function ContactoPage() {
  const whatsappHref = buildWhatsappUrl();
  const whatsappDisplay = getWhatsappDisplayNumber();

  const channels = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: whatsappDisplay,
      href: whatsappHref,
      hint: 'Respuesta más rápida',
    },
    {
      icon: InstagramGlyph,
      label: 'Instagram',
      value: '@a.mantis.lenceria',
      href: 'https://www.instagram.com/a.mantis.lenceria',
      hint: 'Catálogo visual y novedades',
    },
    {
      icon: FacebookGlyph,
      label: 'Facebook',
      value: 'Ámantis Lencería',
      href: 'https://www.facebook.com/profile.php?id=100077885707039',
      hint: 'Promociones y comunidad',
    },
  ] as const;

  return (
    <StaticPageShell
      title="Contacto"
      intro="Escríbenos por el canal que prefieras. La asesoría es personal y el trato siempre discreto."
    >
      <ul className="space-y-3">
        {channels.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-lg border border-border/60 bg-bg p-4 transition-colors hover:border-border-strong hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <c.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[13px] font-semibold text-fg">
                  {c.label}
                </p>
                <p className="mt-0.5 truncate font-sans text-[14px] text-fg-muted group-hover:text-fg">
                  {c.value}
                </p>
                <p className="mt-1 font-sans text-[11px] text-fg-subtle">
                  {c.hint}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <section className="space-y-2 rounded-lg border border-border/60 bg-surface-alt p-4">
        <div className="flex items-center gap-2 font-serif text-[16px] font-medium text-fg">
          <MapPin aria-hidden className="h-4 w-4 text-primary" strokeWidth={1.75} />
          Ubicación
        </div>
        <p className="text-fg-muted">
          Operamos desde Ciudad del Carmen, Campeche. Hacemos envíos a todo el
          país por acuerdo con la paquetería que prefieras.
        </p>
      </section>
    </StaticPageShell>
  );
}
