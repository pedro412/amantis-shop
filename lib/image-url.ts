/**
 * Client-safe helpers for resolving R2 image URLs from a stored keyBase.
 *
 * These don't import anything from the server S3 client, so they can
 * be used in client components and server components alike. The base
 * URL must be exposed via NEXT_PUBLIC_R2_PUBLIC_URL so it survives
 * client bundling.
 */

const VARIANT_FILES = {
  thumb: 'thumb.webp',
  medium: 'medium.webp',
  full: 'full.webp',
} as const;

export type ImageVariant = keyof typeof VARIANT_FILES;

function publicBase(): string {
  const url = process.env['NEXT_PUBLIC_R2_PUBLIC_URL'];
  if (!url) throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL is missing');
  return url.replace(/\/$/, '');
}

export function imagePublicUrl(keyBase: string, variant: ImageVariant): string {
  return `${publicBase()}/${keyBase}/${VARIANT_FILES[variant]}`;
}

export function imagePublicUrls(keyBase: string): Record<ImageVariant, string> {
  return {
    thumb: imagePublicUrl(keyBase, 'thumb'),
    medium: imagePublicUrl(keyBase, 'medium'),
    full: imagePublicUrl(keyBase, 'full'),
  };
}
