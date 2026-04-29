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
    | 'imageKeys'
    | 'variants',
    string
  >
> & {
  variantRows?: Record<number, VariantRowErrors>;
};

export type VariantRowErrors = Partial<
  Record<'name' | 'sku' | 'priceOverride' | 'stock', string>
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

const variantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa un nombre.')
    .max(60, 'Máximo 60 caracteres.'),
  sku: z
    .string()
    .trim()
    .max(60, 'Máximo 60 caracteres.')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  priceOverride: decimalOptional,
  stock: z
    .string()
    .trim()
    .regex(/^\d{1,9}$/, 'Stock inválido.')
    .transform((v) => Number(v)),
});

const variantsSchema = z.array(variantSchema).max(20, 'Máximo 20 variantes.').default([]);

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
  variants: variantsSchema,
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
  const allowed = new Set([
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
  ]);
  const variantRowKeys = new Set(['name', 'sku', 'priceOverride', 'stock']);
  for (const issue of err.issues) {
    const [head, idx, leaf] = issue.path;
    if (head === 'variants' && typeof idx === 'number' && typeof leaf === 'string' && variantRowKeys.has(leaf)) {
      const rows = (out.variantRows ??= {});
      const row = (rows[idx] ??= {});
      const k = leaf as keyof VariantRowErrors;
      if (!row[k]) row[k] = issue.message;
      if (!out.variants) out.variants = 'Revisa las variantes marcadas.';
      continue;
    }
    if (typeof head === 'string' && allowed.has(head)) {
      const k = head as keyof ProductFieldErrors;
      if (k !== 'variants' && !out[k]) (out as Record<string, string>)[k] = issue.message;
    }
  }
  return out;
}

function parseVariantsFromForm(formData: FormData): unknown[] {
  // Each row is sent as one `variant` entry containing JSON; preserves order.
  const raw = formData.getAll('variant').filter((v): v is string => typeof v === 'string');
  const out: unknown[] = [];
  for (const s of raw) {
    try {
      out.push(JSON.parse(s));
    } catch {
      // Treat malformed rows as a name validation error so the user sees something
      // actionable instead of a silent drop.
      out.push({ name: '', stock: '0' });
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

function uniqueConflictFieldErrors(
  err: unknown,
  variantSkus?: (string | null)[],
): ProductFieldErrors | null {
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
        // ProductVariant.sku and Product.sku share the global unique namespace
        // by being indexed separately; we can't tell from `target` alone which
        // model triggered it. If the conflicting value matches a variant SKU
        // submitted in this payload, point the error at that row.
        if (variantSkus && variantSkus.length > 0) {
          // Best-effort: blame the first variant carrying any submitted SKU,
          // since the conflict is almost always a duplicate the user just typed.
          const firstWithSku = variantSkus.findIndex((s) => s !== null && s !== '');
          if (firstWithSku !== -1) {
            return {
              variants: 'Una variante tiene un SKU duplicado.',
              variantRows: { [firstWithSku]: { sku: 'SKU ya está en uso.' } },
            };
          }
        }
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

  const variantsRaw = parseVariantsFromForm(formData);

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
    variants: variantsRaw,
  });

  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;
  const hasVariants = data.variants.length > 0;
  const effectiveStock = hasVariants
    ? data.variants.reduce((acc, v) => acc + v.stock, 0)
    : data.stock;

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
        stock: effectiveStock,
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
        ...(hasVariants
          ? {
              variants: {
                create: data.variants.map((v, idx) => ({
                  name: v.name,
                  sku: v.sku,
                  priceOverride: v.priceOverride
                    ? new Prisma.Decimal(v.priceOverride)
                    : null,
                  stock: v.stock,
                  sortOrder: idx,
                })),
              },
            }
          : {}),
      },
      select: { id: true },
    });
    revalidatePath(PRODUCTS_PATH);
    revalidatePath('/');
    revalidatePath('/categoria/[slug]', 'page');
    revalidatePath('/producto/[slug]', 'page');
    return { ok: true, id: created.id };
  } catch (err) {
    const fieldErrors = uniqueConflictFieldErrors(
      err,
      data.variants.map((v) => v.sku),
    );
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

  const variantsRaw = parseVariantsFromForm(formData);

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
    variants: variantsRaw,
  });

  if (!parsed.success) {
    return {
      error: 'Revisa los campos marcados.',
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;
  const hasVariants = data.variants.length > 0;
  const effectiveStock = hasVariants
    ? data.variants.reduce((acc, v) => acc + v.stock, 0)
    : data.stock;

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
    // Replace images and variants atomically so the persisted set + order
    // matches what the form sent. R2 cleanup of removed photos is best-effort
    // client-side; we simply rebuild DB rows here.
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: data.id } }),
      prisma.productVariant.deleteMany({ where: { productId: data.id } }),
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
          stock: effectiveStock,
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
          ...(hasVariants
            ? {
                variants: {
                  create: data.variants.map((v, idx) => ({
                    name: v.name,
                    sku: v.sku,
                    priceOverride: v.priceOverride
                      ? new Prisma.Decimal(v.priceOverride)
                      : null,
                    stock: v.stock,
                    sortOrder: idx,
                  })),
                },
              }
            : {}),
        },
      }),
    ]);
    revalidatePath(PRODUCTS_PATH);
    revalidatePath('/');
    revalidatePath('/categoria/[slug]', 'page');
    revalidatePath('/producto/[slug]', 'page');
    revalidatePath(`${PRODUCTS_PATH}/${data.id}`);
    return { ok: true };
  } catch (err) {
    const fieldErrors = uniqueConflictFieldErrors(
      err,
      data.variants.map((v) => v.sku),
    );
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
      select: {
        slug: true,
        sku: true,
        deletedAt: true,
        variants: { select: { id: true, sku: true } },
      },
    });
    if (!product || product.deletedAt) {
      return { error: 'No encontramos ese producto.' };
    }

    // Same defense as categorías: the column-level unique constraints on
    // slug + sku are global, so a soft-deleted row would squat on those
    // values forever. Tombstone product slug/sku and any variant SKUs too.
    const ts = Date.now();
    const slugSuffix = `__del_${ts}`;
    const tombstonedSlug = `${product.slug.slice(0, 120 - slugSuffix.length)}${slugSuffix}`;
    const tombstonedSku = product.sku
      ? `${product.sku.slice(0, 60 - slugSuffix.length)}${slugSuffix}`
      : null;

    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          slug: tombstonedSlug,
          sku: tombstonedSku,
        },
      }),
      ...product.variants
        .filter((v) => v.sku !== null)
        .map((v, i) =>
          prisma.productVariant.update({
            where: { id: v.id },
            data: {
              sku: `${v.sku!.slice(0, 60 - slugSuffix.length - String(i).length - 1)}${slugSuffix}_${i}`,
            },
          }),
        ),
    ]);
    revalidatePath(PRODUCTS_PATH);
    revalidatePath('/');
    revalidatePath('/categoria/[slug]', 'page');
    revalidatePath('/producto/[slug]', 'page');
    return { ok: true };
  } catch (err) {
    console.error('[softDeleteProductAction] failed', err);
    return { error: 'No pudimos eliminar el producto. Intenta de nuevo.' };
  }
}
