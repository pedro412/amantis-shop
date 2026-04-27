'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { SLUG_REGEX } from '@/lib/slugify';
import { prisma } from '@/server/lib/prisma';

const LIST_PATH = '/admin/categorias';

export type CategoryFieldErrors = Partial<Record<'name' | 'slug' | 'description' | 'imageKey', string>>;

export type CreateCategoryState =
  | { ok: true; id: string }
  | { error: string; fieldErrors?: CategoryFieldErrors }
  | undefined;

export type UpdateCategoryState =
  | { ok: true }
  | { error: string; fieldErrors?: CategoryFieldErrors }
  | undefined;

export type DeleteCategoryState =
  | { ok: true }
  | { error: string; productCount?: number };

const baseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa un nombre.')
    .max(80, 'Máximo 80 caracteres.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Ingresa un slug.')
    .max(80, 'Máximo 80 caracteres.')
    .regex(SLUG_REGEX, 'Solo minúsculas, números y guiones.'),
  description: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres.')
    .optional()
    .transform((v) => (v ? v : null)),
  imageKey: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .transform((v) => (v ? v : null)),
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true'),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({ id: z.string().min(1) });
const idSchema = z.string().min(1);

function fieldErrorsFrom(err: z.ZodError): CategoryFieldErrors {
  const out: CategoryFieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (key === 'name' || key === 'slug' || key === 'description' || key === 'imageKey') {
      if (!out[key]) out[key] = issue.message;
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

function isUniqueSlugError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002' &&
    Array.isArray(err.meta?.['target']) &&
    (err.meta['target'] as string[]).includes('slug')
  );
}

export async function createCategoryAction(
  _prev: CreateCategoryState,
  formData: FormData,
): Promise<CreateCategoryState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') ?? undefined,
    imageKey: formData.get('imageKey') ?? undefined,
    isActive: formData.get('isActive'),
  });
  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    const created = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        imageKey: parsed.data.imageKey,
        isActive: parsed.data.isActive,
      },
      select: { id: true },
    });
    revalidatePath(LIST_PATH);
    return { ok: true, id: created.id };
  } catch (err) {
    if (isUniqueSlugError(err)) {
      return {
        error: 'Revisa los campos marcados.',
        fieldErrors: { slug: 'Ya existe una categoría con ese slug.' },
      };
    }
    console.error('[createCategoryAction] failed', err);
    return { error: 'No pudimos crear la categoría. Intenta de nuevo.' };
  }
}

export async function updateCategoryAction(
  _prev: UpdateCategoryState,
  formData: FormData,
): Promise<UpdateCategoryState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') ?? undefined,
    imageKey: formData.get('imageKey') ?? undefined,
    isActive: formData.get('isActive'),
  });
  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        imageKey: parsed.data.imageKey,
        isActive: parsed.data.isActive,
      },
    });
    revalidatePath(LIST_PATH);
    revalidatePath(`${LIST_PATH}/${parsed.data.id}`);
    return { ok: true };
  } catch (err) {
    if (isUniqueSlugError(err)) {
      return {
        error: 'Revisa los campos marcados.',
        fieldErrors: { slug: 'Ya existe una categoría con ese slug.' },
      };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return { error: 'No encontramos esa categoría.' };
    }
    console.error('[updateCategoryAction] failed', err);
    return { error: 'No pudimos guardar los cambios. Intenta de nuevo.' };
  }
}

export async function softDeleteCategoryAction(
  rawId: string,
): Promise<DeleteCategoryState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const idParsed = idSchema.safeParse(rawId);
  if (!idParsed.success) return { error: 'Identificador inválido.' };
  const id = idParsed.data;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        deletedAt: true,
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
    if (!category || category.deletedAt) {
      return { error: 'No encontramos esa categoría.' };
    }
    if (category._count.products > 0) {
      return {
        error:
          'Esta categoría tiene productos asociados. Desactívala en su lugar.',
        productCount: category._count.products,
      };
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    revalidatePath(LIST_PATH);
    return { ok: true };
  } catch (err) {
    console.error('[softDeleteCategoryAction] failed', err);
    return { error: 'No pudimos eliminar la categoría. Intenta de nuevo.' };
  }
}
