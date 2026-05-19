import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

import { SITE_URL } from '@/lib/site-url';

const SITE_NAME = 'A’Mantis';
const SITE_DESCRIPTION =
  'Catálogo digital — bienestar e intimidad para mayores de 18 años.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'es_MX',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  // Same theme-color emitted under both media queries so Samsung Internet's
  // Night mode (which inverts the address bar tint) still picks up the light
  // brand color instead of guessing a dark variant.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6F1' },
    { media: '(prefers-color-scheme: dark)', color: '#FAF6F1' },
  ],
  // 'only light' is stricter than 'light' alone — tells the engine we never
  // want a dark variant of any UA-styled control. Pair this with the explicit
  // html background and the prefers-color-scheme: dark override in
  // globals.css to cover browsers that ignore color-scheme entirely.
  colorScheme: 'only light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    // bg-bg on <html> (in addition to body) prevents Chrome's "Force dark
    // mode" heuristic from auto-darkening the root canvas. The flag skips
    // elements with an explicit non-light background outside its dark-target
    // luminance band.
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} bg-bg`}
    >
      <body className="bg-bg text-fg antialiased">{children}</body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
