/**
 * R2 connectivity smoke test.
 *
 *   pnpm dlx dotenv -e .env.local -- tsx scripts/r2-smoke.ts
 *
 * Uploads a tiny PNG, fetches it back via the public URL, deletes it.
 * Exits non-zero on any failure.
 */
import { deleteObject, getPublicUrl, uploadObject } from '@/server/lib/storage';

// 1x1 transparent PNG
const PNG_1X1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000005000100' +
    '0d0a2db40000000049454e44ae426082',
  'hex',
);

async function main() {
  const key = `_smoke/test-${Date.now()}.png`;
  console.log(`Uploading ${key}...`);
  const { url } = await uploadObject({
    key,
    body: PNG_1X1,
    contentType: 'image/png',
  });
  console.log(`Public URL: ${url}`);

  console.log('Fetching via public URL...');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Public fetch failed: ${res.status} ${res.statusText}`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength !== PNG_1X1.byteLength) {
    throw new Error(`Size mismatch: got ${bytes.byteLength}, expected ${PNG_1X1.byteLength}`);
  }
  console.log(`OK (${bytes.byteLength} bytes)`);

  console.log('Cleaning up...');
  await deleteObject(key);
  console.log('R2 smoke test passed.');
}

main().catch((err) => {
  console.error('R2 smoke test FAILED:', err);
  process.exit(1);
});
