'use server';

import { auth } from '@/auth';
import {
  ALLOWED_INPUT_TYPES,
  IMAGE_NAMESPACES,
  IMAGE_VARIANTS,
  MAX_UPLOAD_BYTES,
  type AllowedInputType,
  type ImageNamespace,
  type UploadedImage,
  processAndUploadImage,
} from '@/server/lib/images';

export type UploadImageState =
  | { ok: true; image: UploadedImage }
  | { error: string }
  | undefined;

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_INPUT_TYPES);
const ALLOWED_NAMESPACE_SET = new Set<string>(IMAGE_NAMESPACES);

const MAX_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

/**
 * Auth-gated server action. Receives a multipart `file` plus a
 * `namespace` key, validates them, and processes/uploads the image
 * to R2. Returns the keyBase that should be persisted to the DB.
 */
export async function uploadImageAction(
  _prev: UploadImageState,
  formData: FormData,
): Promise<UploadImageState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'Sesión expirada. Vuelve a iniciar sesión.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecciona una imagen.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `La imagen no puede pesar más de ${MAX_MB} MB.` };
  }
  if (!ALLOWED_TYPE_SET.has(file.type)) {
    return {
      error: 'Formato no soportado. Usa JPG, PNG, WebP o HEIC.',
    };
  }

  const namespace = formData.get('namespace');
  if (typeof namespace !== 'string' || !ALLOWED_NAMESPACE_SET.has(namespace)) {
    return { error: 'Ámbito de imagen inválido.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await processAndUploadImage({
      input: buffer,
      namespace: namespace as ImageNamespace,
    });
    return { ok: true, image };
  } catch (err) {
    console.error('[uploadImageAction] processing failed', {
      type: file.type as AllowedInputType,
      sizeKb: Math.round(file.size / 1024),
      err,
    });
    return {
      error: 'No pudimos procesar la imagen. Intenta con otra foto.',
    };
  }
}

/** Re-export so call sites can build URLs without depending on the lib path. */
export { IMAGE_VARIANTS };
