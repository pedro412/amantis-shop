import sharp from 'sharp';

import { deleteObject, getPublicUrl, uploadObject } from '@/server/lib/storage';

/**
 * Long-edge widths produced for every uploaded image. We always emit
 * three WebP variants so the public catalog can pick the right one
 * (thumb for grids, medium for cards, full for the product detail).
 */
export const IMAGE_VARIANTS = {
  thumb: 200,
  medium: 600,
  full: 1200,
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;
const VARIANT_NAMES = Object.keys(IMAGE_VARIANTS) as ImageVariant[];

const WEBP_QUALITY = 80;

/**
 * Where in the bucket each kind of image lives. Encoded into the
 * stored key so it self-describes and can be deleted/migrated later
 * without consulting the calling table.
 */
export const IMAGE_NAMESPACES = ['categories', 'brands', 'products'] as const;
export type ImageNamespace = (typeof IMAGE_NAMESPACES)[number];

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB raw input
export const ALLOWED_INPUT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;
export type AllowedInputType = (typeof ALLOWED_INPUT_TYPES)[number];

export type UploadedImage = {
  /** Stable identifier — store this in the DB. */
  keyBase: string;
  /** Public URL per variant, ready to render. */
  urls: Record<ImageVariant, string>;
  /** Pixel dimensions of the largest variant (for layout hints). */
  width: number;
  height: number;
};

function randomKey(): string {
  // 16 random bytes → 22-char base64url segment. Good enough collision-wise
  // for object keys, and shorter than a cuid in URLs.
  return crypto.randomUUID().replace(/-/g, '').slice(0, 22);
}

function variantKey(keyBase: string, variant: ImageVariant): string {
  return `${keyBase}/${variant}.webp`;
}

/**
 * Process an in-memory image buffer into 3 WebP variants and upload
 * them in parallel to R2. Returns the keyBase to persist in the DB.
 *
 * Throws on any sharp/upload failure — callers should catch and map
 * to a user-facing error.
 */
export async function processAndUploadImage({
  input,
  namespace,
}: {
  input: Buffer;
  namespace: ImageNamespace;
}): Promise<UploadedImage> {
  const keyBase = `${namespace}/${randomKey()}`;

  // Read metadata once so we can clamp resize and report dimensions.
  const meta = await sharp(input).metadata();

  const variants = await Promise.all(
    VARIANT_NAMES.map(async (variant) => {
      const targetWidth = IMAGE_VARIANTS[variant];
      // Don't upscale: if the source is smaller than the target, keep its size.
      const width = Math.min(targetWidth, meta.width ?? targetWidth);
      const buffer = await sharp(input)
        .rotate() // honour EXIF orientation, then strip it
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const key = variantKey(keyBase, variant);
      await uploadObject({ key, body: buffer, contentType: 'image/webp' });
      return { variant, key };
    }),
  );

  return {
    keyBase,
    urls: Object.fromEntries(
      variants.map((v) => [v.variant, getPublicUrl(v.key)]),
    ) as Record<ImageVariant, string>,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

/** Resolve the public URL for one variant of a previously stored image. */
export function imageUrl(keyBase: string, variant: ImageVariant): string {
  return getPublicUrl(variantKey(keyBase, variant));
}

/** Resolve all 3 variant URLs at once. */
export function imageUrls(keyBase: string): Record<ImageVariant, string> {
  return Object.fromEntries(
    VARIANT_NAMES.map((v) => [v, imageUrl(keyBase, v)]),
  ) as Record<ImageVariant, string>;
}

/** Delete every variant under a stored keyBase. Best-effort, ignores 404s. */
export async function deleteImageVariants(keyBase: string): Promise<void> {
  await Promise.allSettled(
    VARIANT_NAMES.map((v) => deleteObject(variantKey(keyBase, v))),
  );
}
