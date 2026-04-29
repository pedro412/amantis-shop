/**
 * Canonical site URL resolution. Single source of truth used by metadata,
 * sitemap, robots, and JSON-LD so absolute URLs never disagree across the app.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — explicit override (recommended in Vercel prod env).
 * 2. `VERCEL_ENV === 'production'` → production domain. Belt-and-suspenders so
 *    a missing env var doesn't leak the random `*.vercel.app` URL into the
 *    indexed sitemap, OG, or canonical tags.
 * 3. `VERCEL_URL` — preview deploys self-reference.
 * 4. localhost — dev fallback.
 */

const PRODUCTION_DOMAIN = 'https://amantis.com.mx';

function resolveSiteUrl(): string {
  const explicit = process.env['NEXT_PUBLIC_SITE_URL'];
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env['VERCEL_ENV'] === 'production') return PRODUCTION_DOMAIN;
  const vercelUrl = process.env['VERCEL_URL'];
  if (vercelUrl) return `https://${vercelUrl}`;
  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
export const PRODUCTION_SITE_URL = PRODUCTION_DOMAIN;
