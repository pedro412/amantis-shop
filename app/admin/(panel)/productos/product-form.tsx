'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ImageGallery } from '@/components/admin/image-gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SLUG_REGEX, slugify } from '@/lib/slugify';
import { cn } from '@/lib/utils';
import {
  createProductAction,
  type ProductFieldErrors,
  updateProductAction,
  type VariantRowErrors,
} from '@/server/actions/products';

import { VariantsField, type VariantInput } from './variants-field';

const DECIMAL_RE = /^\d+(\.\d{1,2})?$/;
const DRAFT_KEY = 'amantis.product-draft.v1';
const DRAFT_DEBOUNCE_MS = 800;
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const formSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa un nombre.').max(120, 'Máximo 120 caracteres.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Ingresa un slug.')
    .max(120, 'Máximo 120 caracteres.')
    .regex(SLUG_REGEX, 'Solo minúsculas, números y guiones.'),
  shortDescription: z.string().trim().max(200, 'Máximo 200 caracteres.').optional(),
  description: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional(),
  price: z.string().trim().min(1, 'Ingresa un precio.').regex(DECIMAL_RE, 'Usa un número con máx. 2 decimales.'),
  compareAtPrice: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || DECIMAL_RE.test(v), 'Usa un número con máx. 2 decimales.'),
  stock: z
    .string()
    .trim()
    .regex(/^\d{1,9}$/, 'Stock inválido.'),
  sku: z.string().trim().max(60, 'Máximo 60 caracteres.').optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría.'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type CategoryOption = { id: string; name: string; isChild: boolean; parentName: string | null };

type ProductDefaults = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  sku: string | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  imageKeys: string[];
  variants: {
    name: string;
    sku: string | null;
    priceOverride: string | null;
    stock: number;
  }[];
};

type Mode = { kind: 'create' } | { kind: 'edit'; product: ProductDefaults };

type Draft = {
  values: Partial<FormValues>;
  imageKeys: string[];
  variants?: VariantInput[];
  savedAt: number;
};

const EMPTY_VALUES: FormValues = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  sku: '',
  categoryId: '',
  isActive: true,
  isFeatured: false,
};

export function ProductForm({
  mode,
  categories,
}: {
  mode: Mode;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const isEdit = mode.kind === 'edit';

  const initialValues: FormValues = isEdit
    ? {
        name: mode.product.name,
        slug: mode.product.slug,
        shortDescription: mode.product.shortDescription ?? '',
        description: mode.product.description ?? '',
        price: mode.product.price,
        compareAtPrice: mode.product.compareAtPrice ?? '',
        stock: String(mode.product.stock),
        sku: mode.product.sku ?? '',
        categoryId: mode.product.categoryId,
        isActive: mode.product.isActive,
        isFeatured: mode.product.isFeatured,
      }
    : EMPTY_VALUES;

  const [imageKeys, setImageKeys] = useState<string[]>(
    isEdit ? mode.product.imageKeys : [],
  );
  const [variants, setVariants] = useState<VariantInput[]>(
    isEdit
      ? mode.product.variants.map((v) => ({
          rowId: `v-${Math.random().toString(36).slice(2, 10)}`,
          name: v.name,
          sku: v.sku ?? '',
          priceOverride: v.priceOverride ?? '',
          stock: String(v.stock),
        }))
      : [],
  );
  const [serverError, setServerError] = useState<string | undefined>();
  const [serverFieldErrors, setServerFieldErrors] = useState<ProductFieldErrors>({});
  const [draftRestored, setDraftRestored] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();
  // In edit mode the slug is by definition user-decided already; never auto-overwrite.
  const slugTouchedRef = useRef(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');
  const isActiveValue = watch('isActive');
  const isFeaturedValue = watch('isFeatured');

  // Draft autosave/restore is create-only. In edit mode the DB is the source
  // of truth and a stale draft would silently overwrite real data.
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      if (!draft || typeof draft.savedAt !== 'number') return;
      if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        window.localStorage.removeItem(DRAFT_KEY);
        return;
      }
      reset({ ...EMPTY_VALUES, ...draft.values });
      if (Array.isArray(draft.imageKeys) && draft.imageKeys.length > 0) {
        setImageKeys(draft.imageKeys);
      }
      if (Array.isArray(draft.variants) && draft.variants.length > 0) {
        setVariants(draft.variants);
      }
      // If the user had typed a slug different from a fresh slugify, treat
      // the slug as user-touched so we don't clobber it on next name edit.
      const v = { ...EMPTY_VALUES, ...draft.values };
      if (v.slug && v.slug !== slugify(v.name ?? '')) {
        slugTouchedRef.current = true;
      }
      setDraftRestored(true);
    } catch (err) {
      console.error('[ProductForm] draft restore failed', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sync slug from name until the slug is manually edited.
  useEffect(() => {
    if (!slugTouchedRef.current) {
      setValue('slug', slugify(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  // Debounced draft save. Create-only — see comment on the restore effect.
  const allValues = watch();
  useEffect(() => {
    if (isEdit) return;
    const hasContent =
      (allValues.name && allValues.name.length > 0) ||
      (allValues.description && allValues.description.length > 0) ||
      (allValues.price && allValues.price.length > 0) ||
      imageKeys.length > 0 ||
      variants.length > 0;
    if (!hasContent) return;
    const t = setTimeout(() => {
      try {
        const draft: Draft = {
          values: allValues,
          imageKeys,
          variants,
          savedAt: Date.now(),
        };
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (err) {
        // Quota / private mode — fine, draft is best-effort.
        console.error('[ProductForm] draft save failed', err);
      }
    }, DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [allValues, imageKeys, variants, isEdit]);

  const discardDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {}
    reset(EMPTY_VALUES);
    setImageKeys([]);
    setVariants([]);
    slugTouchedRef.current = false;
    setDraftRestored(false);
  };

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    setServerFieldErrors({});
    setSavedFlash(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('name', values.name);
      fd.set('slug', values.slug);
      if (values.shortDescription) fd.set('shortDescription', values.shortDescription);
      if (values.description) fd.set('description', values.description);
      fd.set('price', values.price);
      if (values.compareAtPrice) fd.set('compareAtPrice', values.compareAtPrice);
      // When variants exist the server recomputes stock as their sum, so the
      // submitted product-level stock is ignored. Send a placeholder so the
      // schema's required stock field still parses.
      fd.set('stock', variants.length > 0 ? '0' : values.stock);
      if (values.sku) fd.set('sku', values.sku);
      fd.set('categoryId', values.categoryId);
      for (const k of imageKeys) fd.append('imageKey', k);
      for (const v of variants) {
        fd.append(
          'variant',
          JSON.stringify({
            name: v.name,
            sku: v.sku,
            priceOverride: v.priceOverride,
            stock: v.stock,
          }),
        );
      }
      fd.set('isActive', values.isActive ? 'true' : 'false');
      fd.set('isFeatured', values.isFeatured ? 'true' : 'false');

      if (isEdit) {
        fd.set('id', mode.product.id);
        const result = await updateProductAction(undefined, fd);
        if (result && 'error' in result) {
          setServerError(result.error);
          setServerFieldErrors(result.fieldErrors ?? {});
          return;
        }
        setSavedFlash(true);
        router.refresh();
        return;
      }

      const result = await createProductAction(undefined, fd);
      if (result && 'error' in result) {
        setServerError(result.error);
        setServerFieldErrors(result.fieldErrors ?? {});
        return;
      }
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push('/admin/productos');
      router.refresh();
    });
  });

  type ScalarField = Exclude<keyof ProductFieldErrors, 'variantRows'>;
  const fieldErr = (k: ScalarField): string | undefined => {
    if (k in errors) return (errors as Record<string, { message?: string }>)[k]?.message;
    const v = serverFieldErrors[k];
    return typeof v === 'string' ? v : undefined;
  };
  const variantRowErrors: Record<number, VariantRowErrors> | undefined =
    serverFieldErrors.variantRows;
  const variantsTopError =
    typeof serverFieldErrors.variants === 'string' ? serverFieldErrors.variants : undefined;

  const nameError = fieldErr('name');
  const slugError = fieldErr('slug');
  const shortDescError = fieldErr('shortDescription');
  const descError = fieldErr('description');
  const priceError = fieldErr('price');
  const compareError = fieldErr('compareAtPrice');
  const stockError = fieldErr('stock');
  const skuError = fieldErr('sku');
  const categoryError = fieldErr('categoryId');

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {draftRestored && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning/10 px-3.5 py-3 font-sans text-[13px] font-medium text-warning"
        >
          <RotateCcw aria-hidden className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
          <div className="flex-1">
            <p>Restauramos un borrador guardado.</p>
            <button
              type="button"
              onClick={discardDraft}
              className="mt-1 underline-offset-2 hover:underline"
            >
              Descartar borrador
            </button>
          </div>
        </div>
      )}

      <Field htmlFor="image" label="Fotos">
        <ImageGallery
          namespace="products"
          value={imageKeys}
          onChange={setImageKeys}
          maxImages={8}
          hint="Hasta 8 fotos · arrastra para reordenar · la primera es la principal."
        />
      </Field>

      <Field htmlFor="name" label="Nombre" error={nameError}>
        <Input
          id="name"
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
          aria-invalid={!!nameError}
          {...register('name')}
        />
      </Field>

      <Field
        htmlFor="slug"
        label="Slug"
        error={slugError}
        hint={`Vista previa: /producto/${slugValue || '...'}`}
      >
        <Input
          id="slug"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          disabled={pending}
          aria-invalid={!!slugError}
          {...register('slug', {
            onChange: () => {
              slugTouchedRef.current = true;
            },
          })}
        />
      </Field>

      <Field
        htmlFor="shortDescription"
        label="Descripción corta"
        error={shortDescError}
        hint="Aparece en las cards del catálogo (máx. 200)"
      >
        <Input
          id="shortDescription"
          autoComplete="off"
          maxLength={210}
          disabled={pending}
          aria-invalid={!!shortDescError}
          {...register('shortDescription')}
        />
      </Field>

      <Field
        htmlFor="description"
        label="Descripción"
        error={descError}
        hint="Aparece en el detalle del producto"
      >
        <Textarea
          id="description"
          rows={5}
          maxLength={2050}
          disabled={pending}
          aria-invalid={!!descError}
          {...register('description')}
        />
      </Field>

      {variants.length > 0 ? (
        <Field htmlFor="price" label="Precio (MXN)" error={priceError}>
          <Input
            id="price"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            disabled={pending}
            aria-invalid={!!priceError}
            {...register('price')}
          />
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field htmlFor="price" label="Precio (MXN)" error={priceError}>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              disabled={pending}
              aria-invalid={!!priceError}
              {...register('price')}
            />
          </Field>

          <Field htmlFor="stock" label="Stock" error={stockError}>
            <Input
              id="stock"
              type="text"
              inputMode="numeric"
              placeholder="0"
              disabled={pending}
              aria-invalid={!!stockError}
              {...register('stock')}
            />
          </Field>
        </div>
      )}

      <Field
        htmlFor="compareAtPrice"
        label="Precio antes (opcional)"
        error={compareError}
        hint="Si lo llenas, aparece tachado junto al precio."
      >
        <Input
          id="compareAtPrice"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          disabled={pending}
          aria-invalid={!!compareError}
          {...register('compareAtPrice')}
        />
      </Field>

      <Field
        htmlFor="categoryId"
        label="Categoría"
        error={categoryError}
        hint="Una sola por ahora · podrás agregar más en el editor"
      >
        <Select
          id="categoryId"
          disabled={pending}
          aria-invalid={!!categoryError}
          {...register('categoryId')}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field htmlFor="sku" label="SKU (opcional)" error={skuError}>
        <Input
          id="sku"
          autoComplete="off"
          autoCapitalize="characters"
          disabled={pending}
          aria-invalid={!!skuError}
          {...register('sku')}
        />
      </Field>

      <VariantsField
        value={variants}
        onChange={setVariants}
        rowErrors={variantRowErrors}
        disabled={pending}
      />
      {variantsTopError && !Object.keys(variantRowErrors ?? {}).length && (
        <p className="-mt-2 font-sans text-[12px] text-destructive">{variantsTopError}</p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <ToggleRow
          title="Producto activo"
          description="Visible en el catálogo público."
          checked={isActiveValue}
          onCheckedChange={(c) => setValue('isActive', c, { shouldDirty: true })}
          disabled={pending}
        />
        <div className="border-t border-border" />
        <ToggleRow
          title="Destacado"
          description="Aparece en la home y secciones destacadas."
          checked={isFeaturedValue}
          onCheckedChange={(c) => setValue('isFeatured', c, { shouldDirty: true })}
          disabled={pending}
        />
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-3 font-sans text-[13px] font-medium text-destructive"
        >
          <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{serverError}</span>
        </div>
      )}

      {savedFlash && !serverError && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/10 px-3.5 py-3 font-sans text-[13px] font-medium text-success"
        >
          <CheckCircle2 aria-hidden className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Cambios guardados.</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full tracking-normal"
        disabled={pending}
      >
        {pending
          ? isEdit
            ? 'Guardando…'
            : 'Creando…'
          : isEdit
            ? 'Guardar cambios'
            : 'Crear producto'}
      </Button>
    </form>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5">
      <div className="flex-1">
        <p className="font-sans text-[14px] font-medium text-fg">{title}</p>
        <p className="mt-0.5 font-sans text-[11px] text-fg-muted">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
      />
    </label>
  );
}

function Field({
  htmlFor,
  label,
  error,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5">
        {label}
      </Label>
      {children}
      {error ? (
        <p className={cn('mt-1.5 font-sans text-[12px] text-destructive')}>{error}</p>
      ) : hint ? (
        <p className="mt-1.5 font-sans text-[12px] text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
