/**
 * Daily database backup runner.
 *
 * Streams `pg_dump $DATABASE_URL` through gzip and uploads the result to R2
 * under `backups/amantis-YYYY-MM-DD-HHmm.sql.gz`. After upload, scans the
 * `backups/` prefix and deletes objects older than 30 days.
 *
 * Designed to run as a Railway cron service:
 *   schedule: 0 5 * * *
 *   command:  pnpm backup
 *
 * Requires env: DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, R2_BACKUPS_BUCKET. Inherits R2 credentials from the
 * existing app config (Railway sets them at the project level).
 *
 * Flags:
 *   --dry-run   Run pg_dump and report what would be uploaded/deleted, but
 *               don't touch R2. Useful for local verification.
 */

import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { spawn } from 'node:child_process';
import { createGzip } from 'node:zlib';

const RETENTION_DAYS = 30;
const PREFIX = 'backups/';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function timestamp(date: Date): string {
  // 2026-04-29-0500 (UTC). Stable, lexicographically sortable.
  const iso = date.toISOString();
  return `${iso.slice(0, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}`;
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function runPgDump(databaseUrl: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    // --format=custom is more compact and supports parallel restore. Compress
    // again with gzip for cheap incremental wins on highly-textual columns.
    const proc = spawn(
      'pg_dump',
      ['--format=custom', '--no-owner', '--no-acl', databaseUrl],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    const gzip = createGzip();
    proc.stdout.pipe(gzip);

    streamToBuffer(gzip).then(resolve).catch(reject);

    let stderrBuf = '';
    proc.stderr.on('data', (d) => {
      stderrBuf += d.toString();
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `pg_dump exited with code ${code}.\nstderr:\n${stderrBuf || '(empty)'}`,
          ),
        );
      }
    });
  });
}

function r2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

async function pruneOldBackups(
  client: S3Client,
  bucket: string,
  dryRun: boolean,
): Promise<{ deleted: string[]; kept: number }> {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const deleted: string[] = [];
  let kept = 0;
  let continuationToken: string | undefined;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: PREFIX,
        ContinuationToken: continuationToken,
      }),
    );

    for (const obj of list.Contents ?? []) {
      if (!obj.Key || !obj.LastModified) continue;
      if (obj.LastModified.getTime() < cutoff) {
        if (!dryRun) {
          await client.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key }),
          );
        }
        deleted.push(obj.Key);
      } else {
        kept += 1;
      }
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);

  return { deleted, kept };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const startedAt = Date.now();

  const databaseUrl = requireEnv('DATABASE_URL');
  const bucket = requireEnv('R2_BACKUPS_BUCKET');
  const key = `${PREFIX}amantis-${timestamp(new Date())}.sql.gz`;

  console.log(`[backup] starting${dryRun ? ' (dry-run)' : ''}`);
  console.log(`[backup] target: r2://${bucket}/${key}`);

  const dump = await runPgDump(databaseUrl);
  console.log(`[backup] dump size: ${(dump.length / 1024 / 1024).toFixed(2)} MiB`);

  if (dump.length < 1024) {
    throw new Error('Dump suspiciously small (<1 KiB). Aborting upload.');
  }

  if (!dryRun) {
    const client = r2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: dump,
        ContentType: 'application/gzip',
        ContentEncoding: 'gzip',
      }),
    );
    console.log(`[backup] uploaded ${key}`);

    const { deleted, kept } = await pruneOldBackups(client, bucket, false);
    console.log(
      `[backup] retention: kept ${kept}, deleted ${deleted.length}` +
        (deleted.length > 0 ? `\n  - ${deleted.join('\n  - ')}` : ''),
    );
  } else {
    console.log('[backup] dry-run: skipping upload + retention sweep');
  }

  console.log(`[backup] done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error('[backup] FAILED');
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
