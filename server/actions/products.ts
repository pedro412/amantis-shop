'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { SLUG_REGEX } from '@/lib/slugify';
import { prisma } from '@/server/lib/prisma';

const PRODUCTS_PATH = '/admin/productos';

export type ProductFieldErrors = Partial<
  Record<
    | 'name'
    | 'slug'
    | 'shortDescription'
    | 'description'
    | 'price'
    | 'compareAtPrice'
    | 'stock'
    | 'sku'
    | 'categoryId'
    | 'imageKeys',
    string
  >
>;

export type CreateProductState =
  | { ok: true; id: string }
  | { error: string; fieldErrors?: ProductFieldErrors }
  | undefined;

export type UpdateProductState =
  | { ok: true }
  | { error: string; fieldErrors?: ProductFieldErrors }
  | undefined;

export type DeleteProductState = { ok: true } | { error: string };

const DECIMAL_RE = /^\d+(\.\d{1,2})?$/;

const decimalRequired = z
  .string()
  .trim()
  .min(1, 'Ingresa un precio.')
  .regex(DECIMAL_RE, 'Usa un número con máx. 2 decimales.');

const decimalOptional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine((v) => v === null || DECIMAL_RE.test(v), {
    message: 'Usa un número con máx. 2 decimales.',
  });

const baseSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa un nombre.').max(120, 'Máximo 120 caracteres.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Ingresa un slug.')
    .max(120, 'Máximo 120 caracteres.')
    .regex(SLUG_REGEX, 'Solo minúsculas, números y guiones.'),
  shortDescription: z
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres.')
    .optional()
    .transform((v) => (v ? v : null)),
  description: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres.')
    .optional()
    .transform((v) => (v ? v : null)),
  price: decimalRequired,
  compareAtPrice: decimalOptional,
  stock: z
    .string()
    .trim()
    .regex(/^\d{1,9}$/, 'Stock inválido.')
    .transform((v) => Number(v)),
  sku: z
    .string()
    .trim()
    .max(60, 'Máximo 60 caracteres.')
    .optional()
    .transform((v) => (v ? v : null)),
  categoryId: z.string().min(1, 'Selecciona una categoría.'),
  imageKeys: z
    .array(z.string().trim().min(1).max(200))
    .max(8, 'Máximo 8 imágenes.')
    .default([]),
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true'),
  isFeatured: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true'),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({ id: z.string().min(1) });
const idSchema = z.string().min(1);

function fieldErrorsFrom(err: z.ZodError): ProductFieldErrors {
  const out: ProductFieldErrors = {};
  const allowed: (keyof ProductFieldErrors)[] = [
    'name',
    'slug',
    'shortDescription',
    'description',
    'price',
    'compareAtPrice',
    'stock',
    'sku',
    'categoryId',
    'imageKeys',
  ];
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && (allowed as string[]).includes(key)) {
      const k = key as keyof ProductFieldErrors;
      if (!out[k]) out[k] = issue.message;
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

function uniqueConflictFieldErrors(err: unknown): ProductFieldErrors | null {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    const target = err.meta?.['target'];
    if (Array.isArray(target)) {
      if (target.includes('slug')) {
        return { slug: 'Ya existe un producto con ese slug.' };
      }
      if (target.includes('sku')) {
        return { sku: 'Ya existe un producto con ese SKU.' };
      }
    }
  }
  return null;
}

export async function createProductAction(
  _prev: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  // Multi-image gallery sends one `imageKey` entry per photo, in display
  // order. Strip non-strings (Files etc., shouldn't happen but be defensive).
  const imageKeys = formData
    .getAll('imageKey')
    .filter((v): v is string => typeof v === 'string' && v.length > 0);

  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    shortDescription: formData.get('shortDescription') ?? undefined,
    description: formData.get('description') ?? undefined,
    price: formData.get('price'),
    compareAtPrice: formData.get('compareAtPrice') ?? undefined,
    stock: formData.get('stock') ?? '0',
    sku: formData.get('sku') ?? undefined,
    categoryId: formData.get('categoryId'),
    imageKeys,
    isActive: formData.get('isActive'),
    isFeatured: formData.get('isFeatured'),
  });

  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;

  // Defense: confirm the chosen category still exists. The select only shows
  // alive categories, but a stale tab + a deleted category would otherwise
  // throw a foreign-key error here that's harder to translate.
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { deletedAt: true },
  });
  if (!category || category.deletedAt) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: { categoryId: 'La categoría no existe.' },
    };
  }

  try {
    const created = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        compareAtPrice: data.compareAtPrice
          ? new Prisma.Decimal(data.compareAtPrice)
          : null,
        stock: data.stock,
        sku: data.sku,
        categoryId: data.categoryId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        ...(data.imageKeys.length > 0
          ? {
              images: {
                create: data.imageKeys.map((key, idx) => ({
                  key,
                  sortOrder: idx,
                })),
              },
            }
          : {}),
      },
      select: { id: true },
    });
    revalidatePath(PRODUCTS_PATH);
    return { ok: true, id: created.id };
  } catch (err) {
    const fieldErrors = uniqueConflictFieldErrors(err);
    if (fieldErrors) {
      return { error: 'Revisa los campos marcados.', fieldErrors };
    }
    console.error('[createProductAction] failed', err);
    return { error: 'No pudimos crear el producto. Intenta de nuevo.' };
  }
}

export async function updateProductAction(
  _prev: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const imageKeys = formData
    .getAll('imageKey')
    .filter((v): v is string => typeof v === 'string' && v.length > 0);

  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    shortDescription: formData.get('shortDescription') ?? undefined,
    description: formData.get('description') ?? undefined,
    price: formData.get('price'),
    compareAtPrice: formData.get('compareAtPrice') ?? undefined,
    stock: formData.get('stock') ?? '0',
    sku: formData.get('sku') ?? undefined,
    categoryId: formData.get('categoryId'),
    imageKeys,
    isActive: formData.get('isActive'),
    isFeatured: formData.get('isFeatured'),
  });

  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { deletedAt: true },
  });
  if (!category || category.deletedAt) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: { categoryId: 'La categoría no existe.' },
    };
  }

  try {
    // Replace all images in one transaction so the resulting set + sortOrder
    // exactly matches what the gallery sent. R2 cleanup of removed files is
    // already handled client-side when the user taps the X (best-effort);
    // this simply syncs DB rows to the displayed order.
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: data.id } }),
      prisma.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          price: new Prisma.Decimal(data.price),
          compareAtPrice: data.compareAtPrice
            ? new Prisma.Decimal(data.compareAtPrice)
            : null,
          stock: data.stock,
          sku: data.sku,
          categoryId: data.categoryId,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          ...(data.imageKeys.length > 0
            ? {
                images: {
                  create: data.imageKeys.map((key, idx) => ({
                    key,
                    sortOrder: idx,
                  })),
                },
              }
            : {}),
        },
      }),
    ]);
    revalidatePath(PRODUCTS_PATH);
    revalidatePath(`${PRODUCTS_PATH}/${data.id}`);
    return { ok: true };
  } catch (err) {
    const fieldErrors = uniqueConflictFieldErrors(err);
    if (fieldErrors) {
      return { error: 'Revisa los campos marcados.', fieldErrors };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return { error: 'No encontramos ese producto.' };
    }
    console.error('[updateProductAction] failed', err);
    return { error: 'No pudimos guardar los cambios. Intenta de nuevo.' };
  }
}

export async function softDeleteProductAction(
  rawId: string,
): Promise<DeleteProductState> {
  const guard = await requireAdmin();
  if ('error' in guard) return { error: guard.error };

  const idParsed = idSchema.safeParse(rawId);
  if (!idParsed.success) return { error: 'Identificador inválido.' };
  const id = idParsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { slug: true, sku: true, deletedAt: true },
    });
    if (!product || product.deletedAt) {
      return { error: 'No encontramos ese producto.' };
    }

    // Same defense as categorías: the column-level unique constraints on
    // slug + sku are global, so a soft-deleted row would squat on those
    // values forever. Tombstone both so the originals can be reused.
    const ts = Date.now();
    const slugSuffix = `__del_${ts}`;
    const tombstonedSlug = `${product.slug.slice(0, 120 - slugSuffix.length)}${slugSuffix}`;
    const tombstonedSku = product.sku
      ? `${product.sku.slice(0, 60 - slugSuffix.length)}${slugSuffix}`
      : null;

    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        slug: tombstonedSlug,
        sku: tombstonedSku,
      },
    });
    revalidatePath(PRODUCTS_PATH);
    return { ok: true };
  } catch (err) {
    console.error('[softDeleteProductAction] failed', err);
    return { error: 'No pudimos eliminar el producto. Intenta de nuevo.' };
  }
}
