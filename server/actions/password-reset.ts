'use server';

import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { recordFailure, requireNotRateLimited } from '@/server/lib/auth-rate-limit';
import { LOGIN_PATH } from '@/server/lib/auth-routes';
import { prisma } from '@/server/lib/prisma';
import { sendPasswordResetEmail } from '@/server/lib/resend';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function getBaseUrl(): string {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

// ── Request reset ──────────────────────────────────────────────────────────

const requestSchema = z.object({ email: z.string().email() });

export type RequestState = { ok?: boolean; error?: string } | undefined;

export async function requestPasswordResetAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const parsed = requestSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: 'Ingresa un correo válido.' };

  const email = parsed.data.email.toLowerCase().trim();
  const rateKey = `reset:${email}`;

  // Anti-enumeration: silently no-op when over budget; never tell the client
  // whether the email exists or whether we're suppressing a send.
  let limited = false;
  try {
    requireNotRateLimited(rateKey);
  } catch {
    limited = true;
  }
  recordFailure(rateKey);

  if (!limited) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (user) {
      const rawToken = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

      await prisma.passwordReset.create({
        data: { userId: user.id, token: hashToken(rawToken), expiresAt },
      });

      const resetUrl = `${getBaseUrl()}/admin/reset-password?token=${rawToken}`;
      try {
        await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
      } catch (err) {
        console.error('[password-reset] resend send failed', err);
      }
    }
  }

  return { ok: true };
}

// ── Submit new password ────────────────────────────────────────────────────

const resetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`),
});

export type ResetState = { error?: string } | undefined;

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' };
  }

  const tokenHash = hashToken(parsed.data.token);
  const reset = await prisma.passwordReset.findUnique({ where: { token: tokenHash } });

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return { error: 'Este enlace ya no es válido. Solicita uno nuevo.' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: now } }),
    prisma.passwordReset.updateMany({
      where: { userId: reset.userId, usedAt: null, id: { not: reset.id } },
      data: { usedAt: now },
    }),
  ]);

  redirect(`${LOGIN_PATH}?reset=ok`);
}
