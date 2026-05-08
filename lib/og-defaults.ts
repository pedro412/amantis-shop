/**
 * Branded OG image served by `app/opengraph-image.tsx` (1200×630 PNG).
 * Spread into per-route `openGraph.images` so each route's metadata block
 * carries the image — Next 14 doesn't deep-merge nested metadata fields,
 * so a route that defines `openGraph: {...}` without `images` would show
 * no preview on Facebook even when the file convention exists.
 */
export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'A’Mantis · Bienestar e intimidad',
} as const;

export const DEFAULT_OG_IMAGES = [DEFAULT_OG_IMAGE];

/** Same image, twitter-shaped (just url + alt). */
export const DEFAULT_TWITTER_IMAGES = [
  { url: '/opengraph-image', alt: DEFAULT_OG_IMAGE.alt },
];
