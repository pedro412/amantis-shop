'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { SLUG_REGEX } from '@/lib/slugify';
import { prisma } from '@/server/lib/prisma';

const LIST_PATH = '/admin/categorias';

export type CategoryFieldErrors = Partial<
  Record<'name' | 'slug' | 'description' | 'imageKey' | 'parentId', string>
>;

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
  | { error: string; productCount?: number; childCount?: number };

export type ReorderCategoriesState = { ok: true } | { error: string };

const NO_PARENT_SENTINEL = '__none__';

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
  parentId: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => (v && v !== NO_PARENT_SENTINEL ? v : null)),
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
    if (
      key === 'name' ||
      key === 'slug' ||
      key === 'description' ||
      key === 'imageKey' ||
      key === 'parentId'
    ) {
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

/**
 * Application-level depth/cycle check. Schema allows arbitrary trees, but
 * the admin UX only supports two levels: top-level → one row of children.
 *
 * Rules:
 *  - parentId === null is always fine.
 *  - parentId === self.id rejected (defense in depth — UI hides self too).
 *  - Parent must exist, not deleted, and itself be top-level.
 *  - On update: if self has live children, refuse to make it a child
 *    (otherwise its children would jump to depth 3).
 */
async function assertParentValid({
  selfId,
  parentId,
}: {
  selfId: string | null;
  parentId: string | null;
}): Promise<{ ok: true } | { fieldErrors: CategoryFieldErrors }> {
  if (parentId === null) return { ok: true };
  if (selfId && parentId === selfId) {
    return {
      fieldErrors: { parentId: 'No puede ser su propia categoría padre.' },
    };
  }

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { id: true, deletedAt: true, parentId: true },
  });
  if (!parent || parent.deletedAt) {
    return { fieldErrors: { parentId: 'La categoría padre no existe.' } };
  }
  if (parent.parentId !== null) {
    return {
      fieldErrors: {
        parentId: 'La categoría padre debe ser de primer nivel.',
      },
    };
  }

  if (selfId) {
    const self = await prisma.category.findUnique({
      where: { id: selfId },
      select: {
        _count: { select: { children: { where: { deletedAt: null } } } },
      },
    });
    if (self && self._count.children > 0) {
      return {
        fieldErrors: {
          parentId:
            'Esta categoría tiene subcategorías. Muévelas a otra categoría primero.',
        },
      };
    }
  }

  return { ok: true };
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
    parentId: formData.get('parentId') ?? undefined,
    isActive: formData.get('isActive'),
  });
  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const parentCheck = await assertParentValid({
    selfId: null,
    parentId: parsed.data.parentId,
  });
  if ('fieldErrors' in parentCheck) {
    return { error: 'Revisa los campos marcados.', fieldErrors: parentCheck.fieldErrors };
  }

  try {
    const created = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        imageKey: parsed.data.imageKey,
        parentId: parsed.data.parentId,
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
    parentId: formData.get('parentId') ?? undefined,
    isActive: formData.get('isActive'),
  });
  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const parentCheck = await assertParentValid({
    selfId: parsed.data.id,
    parentId: parsed.data.parentId,
  });
  if ('fieldErrors' in parentCheck) {
    return { error: 'Revisa los campos marcados.', fieldErrors: parentCheck.fieldErrors };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        imageKey: parsed.data.imageKey,
        parentId: parsed.data.parentId,
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
        slug: true,
        deletedAt: true,
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            children: { where: { deletedAt: null } },
          },
        },
      },
    });
    if (!category || category.deletedAt) {
      return { error: 'No encontramos esa categoría.' };
    }
    // Children block first — it's a structural problem (orphans), products
    // is a content problem (data loss). Either way: refuse and explain.
    if (category._count.children > 0) {
      return {
        error:
          'Esta categoría tiene subcategorías. Muévelas a otra categoría primero.',
        childCount: category._count.children,
      };
    }
    if (category._count.products > 0) {
      return {
        error:
          'Esta categoría tiene productos asociados. Desactívala en su lugar.',
        productCount: category._count.products,
      };
    }

    // The DB-level `slug @unique` constraint is global, not partial-on-
    // `deletedAt`, so a soft-deleted row would otherwise squat on its slug
    // and block any future create with the same value. Tombstone the slug
    // here so the original is reusable. Truncate first to leave room for the
    // suffix without overflowing the 80-char Zod limit on future rows.
    const SUFFIX = `__del_${Date.now()}`;
    const baseSlug = category.slug.slice(0, 80 - SUFFIX.length);
    const tombstonedSlug = `${baseSlug}${SUFFIX}`;

    await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        slug: tombstonedSlug,
      },
    });
    revalidatePath(LIST_PATH);
    return { ok: true };
  } catch (err) {
    console.error('[softDeleteCategoryAction] failed', err);
    return { error: 'No pudimos eliminar la categoría. Intenta de nuevo.' };
  }
}

const reorderSchema = z.object({
  parentId: z.string().min(1).max(64).nullable(),
  orderedIds: z.array(z.string().min(1).max(64)).min(1).max(100),
});

/**
 * Persist a new sortOrder for every id in `orderedIds` (0..n) within a single
 * scope — top-level (`parentId === null`) or the children of one parent.
 *
 * Refuses if any id doesn't belong to the supplied scope, which catches the
 * "another tab moved or deleted these while you were dragging" race.
 */
export async function reorderCategoriesAction(input: {
  parentId: string | null;
  orderedIds: string[];
}): Promise<ReorderCategoriesState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Datos inválidos.' };
  }
  const { parentId, orderedIds } = parsed.data;

  // Dedupe defensively — a malformed client could send the same id twice.
  if (new Set(orderedIds).size !== orderedIds.length) {
    return { error: 'Datos inválidos.' };
  }

  try {
    const matched = await prisma.category.count({
      where: { id: { in: orderedIds }, parentId, deletedAt: null },
    });
    if (matched !== orderedIds.length) {
      return {
        error:
          'La lista cambió mientras la reordenabas. Recarga e intenta de nuevo.',
      };
    }

    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: idx },
        }),
      ),
    );
    revalidatePath(LIST_PATH);
    return { ok: true };
  } catch (err) {
    console.error('[reorderCategoriesAction] failed', err);
    return { error: 'No pudimos guardar el nuevo orden. Intenta de nuevo.' };
  }
}
