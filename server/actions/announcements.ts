'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/server/lib/prisma';

const PATHS_TO_REVALIDATE = ['/', '/admin/ajustes'];

export type AnnouncementFieldErrors = Partial<Record<'message', string>>;

export type CreateAnnouncementState =
  | { ok: true; id: string }
  | { error: string; fieldErrors?: AnnouncementFieldErrors }
  | undefined;

export type UpdateAnnouncementState =
  | { ok: true }
  | { error: string; fieldErrors?: AnnouncementFieldErrors }
  | undefined;

export type ToggleAnnouncementState =
  | { ok: true }
  | { error: string }
  | undefined;

export type DeleteAnnouncementState =
  | { ok: true }
  | { error: string }
  | undefined;

const messageSchema = z
  .string()
  .trim()
  .min(1, 'Escribe el mensaje del anuncio.')
  .max(200, 'Máximo 200 caracteres.');

const baseSchema = z.object({
  message: messageSchema,
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true'),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({ id: z.string().min(1) });
const idSchema = z.string().min(1);

function fieldErrorsFrom(err: z.ZodError): AnnouncementFieldErrors {
  const out: AnnouncementFieldErrors = {};
  for (const issue of err.issues) {
    if (issue.path[0] === 'message' && !out.message) {
      out.message = issue.message;
    }
  }
  return out;
}

async function requireAdmin(): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'Sesión expirada. Vuelve a iniciar sesión.' };
  }
  return { ok: true };
}

function revalidate() {
  for (const p of PATHS_TO_REVALIDATE) revalidatePath(p);
}

/**
 * Activates exactly one announcement (or none, if id is null) — used by the
 * toggle UI. Wrapping in a transaction keeps the "only one active at a time"
 * invariant atomic.
 */
async function setActiveExclusive(id: string | null): Promise<void> {
  await prisma.$transaction([
    prisma.announcement.updateMany({
      where: { isActive: true, ...(id ? { id: { not: id } } : {}) },
      data: { isActive: false },
    }),
    ...(id
      ? [
          prisma.announcement.update({
            where: { id },
            data: { isActive: true },
          }),
        ]
      : []),
  ]);
}

export async function createAnnouncementAction(
  _prev: CreateAnnouncementState,
  formData: FormData,
): Promise<CreateAnnouncementState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const parsed = createSchema.safeParse({
    message: formData.get('message'),
    isActive: formData.get('isActive'),
  });
  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const created = await prisma.announcement.create({
    data: { message: parsed.data.message, isActive: false },
    select: { id: true },
  });
  if (parsed.data.isActive) {
    await setActiveExclusive(created.id);
  }
  revalidate();
  return { ok: true, id: created.id };
}

export async function updateAnnouncementAction(
  _prev: UpdateAnnouncementState,
  formData: FormData,
): Promise<UpdateAnnouncementState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    message: formData.get('message'),
    isActive: formData.get('isActive'),
  });
  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await prisma.announcement.update({
    where: { id: parsed.data.id },
    data: { message: parsed.data.message },
  });
  if (parsed.data.isActive) {
    await setActiveExclusive(parsed.data.id);
  } else {
    await prisma.announcement.update({
      where: { id: parsed.data.id },
      data: { isActive: false },
    });
  }
  revalidate();
  return { ok: true };
}

export async function toggleAnnouncementAction(
  _prev: ToggleAnnouncementState,
  formData: FormData,
): Promise<ToggleAnnouncementState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const id = idSchema.safeParse(formData.get('id'));
  if (!id.success) return { error: 'ID inválido.' };
  const activate = formData.get('activate') === 'true';

  if (activate) {
    await setActiveExclusive(id.data);
  } else {
    await prisma.announcement.update({
      where: { id: id.data },
      data: { isActive: false },
    });
  }
  revalidate();
  return { ok: true };
}

export async function deleteAnnouncementAction(
  _prev: DeleteAnnouncementState,
  formData: FormData,
): Promise<DeleteAnnouncementState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const id = idSchema.safeParse(formData.get('id'));
  if (!id.success) return { error: 'ID inválido.' };

  await prisma.announcement.delete({ where: { id: id.data } });
  revalidate();
  return { ok: true };
}
