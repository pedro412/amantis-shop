import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { r2, r2Bucket, r2PublicUrl } from '@/server/lib/r2';

type UploadInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  cacheControl?: string;
};

export async function uploadObject({
  key,
  body,
  contentType,
  cacheControl = 'public, max-age=31536000, immutable',
}: UploadInput): Promise<{ key: string; url: string }> {
  await r2.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
  return { key, url: getPublicUrl(key) };
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: key }));
}

export function getPublicUrl(key: string): string {
  return `${r2PublicUrl}/${encodeURI(key)}`;
}
