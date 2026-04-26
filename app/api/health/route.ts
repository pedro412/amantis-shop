import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

import { prisma } from '@/server/lib/prisma';
import { getR2Bucket, getR2Client } from '@/server/lib/r2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CheckResult = { ok: true } | { ok: false; error: string };

async function checkDb(): Promise<CheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function checkR2(): Promise<CheckResult> {
  try {
    await getR2Client().send(new HeadBucketCommand({ Bucket: getR2Bucket() }));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET() {
  const [db, storage] = await Promise.all([checkDb(), checkR2()]);
  const ok = db.ok && storage.ok;
  return NextResponse.json(
    {
      ok,
      checks: { db, storage },
      env: process.env['VERCEL_ENV'] ?? 'local',
      commit: process.env['VERCEL_GIT_COMMIT_SHA']?.slice(0, 7) ?? null,
    },
    { status: ok ? 200 : 503 },
  );
}
