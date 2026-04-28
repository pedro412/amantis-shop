import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/acerca-de', label: 'Acerca de' },
  { href: '/como-comprar', label: 'Cómo comprar' },
  { href: '/zona-de-cobertura', label: 'Zona de cobertura' },
  { href: '/faq', label: 'Preguntas frecuentes' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/aviso-de-privacidad', label: 'Aviso de privacidad' },
  { href: '/terminos', label: 'Términos' },
] as const;

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-surface-alt">
      <div className="mx-auto max-w-md px-5 py-8">
        <p className="font-serif text-h3 font-medium text-fg">ÁMANTIS</p>
        <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-fg-muted">
          Bienestar e intimidad para mayores de 18 años.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-y-2 gap-x-4">
          {LEGAL_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-sans text-[12px] text-fg-muted transition-colors hover:text-fg"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <p className="font-sans text-[11px] leading-relaxed text-fg-subtle">
            Sitio para mayores de 18 años. Productos para uso íntimo y bienestar
            adulto. Pedidos por WhatsApp · pago por transferencia bancaria.
          </p>
          <p className="mt-3 font-sans text-[11px] text-fg-subtle">
            © {year} Ámantis · Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
