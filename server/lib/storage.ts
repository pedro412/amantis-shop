import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { getR2Bucket, getR2Client, getR2PublicUrl } from '@/server/lib/r2';

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
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
  return { key, url: getPublicUrl(key) };
}

export async function deleteObject(key: string): Promise<void> {
  await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }));
}

export function getPublicUrl(key: string): string {
  return `${getR2PublicUrl()}/${encodeURI(key)}`;
}
