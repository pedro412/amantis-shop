import { Heart, MessageCircleMore, Search, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';

import { Badge } from '@/components/badge';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Sistema de diseño · Ámantis',
  robots: { index: false, follow: false },
};

const colors = [
  { name: 'Primary', token: 'bg-primary', hex: '#7A0E20' },
  { name: 'Primary Hover', token: 'bg-primary-hover', hex: '#5E0A18' },
  { name: 'Primary Soft', token: 'bg-primary-soft', hex: '#F5E6E0' },
  { name: 'Background', token: 'bg-bg', hex: '#FAF6F1' },
  { name: 'Surface', token: 'bg-surface', hex: '#FFFFFF' },
  { name: 'Surface Alt', token: 'bg-surface-alt', hex: '#F2EBE3' },
  { name: 'Foreground', token: 'bg-fg', hex: '#1A1614' },
  { name: 'FG Muted', token: 'bg-fg-muted', hex: '#6B5F58' },
  { name: 'FG Subtle', token: 'bg-fg-subtle', hex: '#9A8F87' },
  { name: 'Border', token: 'bg-border', hex: '#E8DFD5' },
  { name: 'Rose', token: 'bg-rose', hex: '#C9A09A' },
  { name: 'Rose Light', token: 'bg-rose-light', hex: '#EBD7D1' },
  { name: 'Success', token: 'bg-success', hex: '#4A6E3A' },
  { name: 'Warning', token: 'bg-warning', hex: '#A86F1F' },
  { name: 'Danger', token: 'bg-danger', hex: '#9A2F2F' },
  { name: 'Info', token: 'bg-info', hex: '#3A5A7E' },
];

const typeScale = [
  { label: 'Display', cls: 'font-serif text-display', sample: 'Discreción y calidez' },
  { label: 'H1', cls: 'font-serif text-h1', sample: 'Lencería e intimidad' },
  { label: 'H2', cls: 'font-serif text-h2', sample: 'Categorías destacadas' },
  { label: 'H3', cls: 'font-serif text-h3', sample: 'Detalles del producto' },
  { label: 'Eyebrow', cls: 'eyebrow', sample: 'Novedades' },
  { label: 'Body LG', cls: 'text-body-lg', sample: 'Conjunto bordado en encaje francés.' },
  { label: 'Body', cls: 'text-body', sample: 'Envíos discretos en empaque neutro.' },
  { label: 'Label', cls: 'text-label font-medium', sample: 'Talla disponible' },
  { label: 'Small', cls: 'text-small', sample: 'Pago por transferencia bancaria' },
  { label: 'Caption', cls: 'text-caption', sample: 'Sitio para mayores de 18 años' },
];

const radii = [
  { name: 'sm', cls: 'rounded-sm', spec: '6 px' },
  { name: 'md', cls: 'rounded-md', spec: '10 px' },
  { name: 'lg', cls: 'rounded-lg', spec: '14 px' },
  { name: 'xl', cls: 'rounded-xl', spec: '20 px' },
  { name: 'full', cls: 'rounded-full', spec: '9999 px' },
];

const shadows = [
  { name: 'sm', cls: 'shadow-sm' },
  { name: 'md', cls: 'shadow-md' },
  { name: 'lg', cls: 'shadow-lg' },
  { name: 'xl', cls: 'shadow-xl' },
];

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <header>
        <p className="eyebrow text-fg-muted">Sección</p>
        <h2 className="mt-2 font-serif text-h1 text-fg">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-body text-fg-muted">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="eyebrow text-fg-muted">Sistema de diseño · v1.0</p>
        <div className="flex items-baseline gap-6">
          <h1 className="font-serif text-display text-fg">Ámantis</h1>
          <Logo size={28} />
        </div>
        <p className="max-w-2xl text-body-lg text-fg-muted">
          Tokens, tipografía y componentes base del catálogo. Mobile-first, sin emojis,
          touch-targets ≥ 44 px.
        </p>
      </header>

      <Section
        title="Color"
        subtitle="Cálidos, sofisticados, sin saturación excesiva. Crimson como única acentuación primaria."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {colors.map((c) => (
            <div key={c.name} className="space-y-2">
              <div className={`h-20 rounded-md border border-border ${c.token}`} aria-hidden />
              <div>
                <p className="text-label text-fg">{c.name}</p>
                <p className="text-caption text-fg-muted">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Tipografía"
        subtitle="Cormorant Garamond para headings; Inter para UI y cuerpo. Mínimo 16 px en mobile (anti-zoom iOS)."
      >
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {typeScale.map((t) => (
              <div
                key={t.label}
                className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <p className="eyebrow w-24 shrink-0 text-fg-muted">{t.label}</p>
                <p className={`${t.cls} text-fg`}>{t.sample}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Spacing"
        subtitle="Base 4 px · 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96."
      >
        <div className="flex items-end gap-3">
          {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className="bg-primary" style={{ width: s, height: s, borderRadius: 2 }} />
              <p className="text-caption text-fg-muted">{s}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-8 sm:grid-cols-2">
        <Section title="Radius">
          <div className="flex flex-col gap-3">
            {radii.map((r) => (
              <div key={r.name} className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 border border-rose bg-primary-soft ${r.cls}`}
                  aria-hidden
                />
                <p className="text-small text-fg-muted">
                  <span className="font-medium text-fg">{r.name}</span> · {r.spec}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Shadow">
          <div className="flex flex-col gap-4">
            {shadows.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div
                  className={`h-11 w-11 rounded-md border border-border bg-surface ${s.cls}`}
                  aria-hidden
                />
                <p className="text-small font-medium text-fg">{s.name}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Botones" subtitle="Pill por defecto · altura mínima 44 px (touch).">
        <Card>
          <CardContent className="flex flex-wrap gap-3 p-6">
            <Button variant="primary">Enviar pedido</Button>
            <Button variant="primary" size="lg">
              Continuar
            </Button>
            <Button variant="primary" size="sm">
              Agregar
            </Button>
            <Button variant="secondary">Ver detalle</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="destructive">Eliminar</Button>
            <Button variant="dark">
              <MessageCircleMore />
              WhatsApp
            </Button>
            <Button variant="primary" size="icon" aria-label="Favorito">
              <Heart />
            </Button>
          </CardContent>
        </Card>
      </Section>

      <Section title="Inputs">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Input placeholder="Buscar productos…" />
            <Input type="email" placeholder="correo@ejemplo.com" />
            <Input disabled placeholder="Campo deshabilitado" />
          </CardContent>
        </Card>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Vibradores de doble estimulación</CardTitle>
              <CardDescription>12 productos · activa</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-fg-muted">
                Card básica con header, descripción y contenido.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface-alt">
            <CardHeader>
              <CardTitle>Card alternativa</CardTitle>
              <CardDescription>Sobre superficie tonal</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-fg-muted">Misma anatomía, distinto fondo.</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Badges">
        <Card>
          <CardContent className="flex flex-wrap gap-3 p-6">
            <Badge>Default</Badge>
            <Badge variant="new">Nuevo</Badge>
            <Badge variant="sale">Oferta</Badge>
            <Badge variant="soft">Destacado</Badge>
            <Badge variant="low">Stock bajo</Badge>
            <Badge variant="out">Agotado</Badge>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Iconos (Lucide)"
        subtitle="Stroke 1.5 por defecto · 1.8 cuando indica estado activo."
      >
        <Card>
          <CardContent className="flex flex-wrap gap-6 p-6 text-fg">
            <Search className="size-6" strokeWidth={1.5} />
            <ShoppingBag className="size-6" strokeWidth={1.5} />
            <Heart className="size-6" strokeWidth={1.5} />
            <MessageCircleMore className="size-6" strokeWidth={1.5} />
          </CardContent>
        </Card>
      </Section>

      <footer className="border-t border-border pt-6 text-caption text-fg-subtle">
        Página de verificación interna · ruta no indexada · ver{' '}
        <code className="font-sans">README.md</code> en{' '}
        <code className="font-sans">design_handoff_amantis_shop/</code>.
      </footer>
    </div>
  );
}
