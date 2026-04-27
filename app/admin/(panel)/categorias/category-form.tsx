'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ImageUpload } from '@/components/admin/image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SLUG_REGEX, slugify } from '@/lib/slugify';
import { cn } from '@/lib/utils';
import {
  type CategoryFieldErrors,
  createCategoryAction,
  updateCategoryAction,
} from '@/server/actions/categories';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa un nombre.').max(80, 'Máximo 80 caracteres.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Ingresa un slug.')
    .max(80, 'Máximo 80 caracteres.')
    .regex(SLUG_REGEX, 'Solo minúsculas, números y guiones.'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type Mode =
  | { kind: 'create' }
  | {
      kind: 'edit';
      category: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageKey: string | null;
        isActive: boolean;
      };
    };

const DESCRIPTION_LIMIT = 500;

export function CategoryForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isEdit = mode.kind === 'edit';

  const [imageKey, setImageKey] = useState<string | null>(
    isEdit ? mode.category.imageKey : null,
  );
  const [serverError, setServerError] = useState<string | undefined>();
  const [serverFieldErrors, setServerFieldErrors] = useState<CategoryFieldErrors>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();
  const slugTouchedRef = useRef(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: isEdit
      ? {
          name: mode.category.name,
          slug: mode.category.slug,
          description: mode.category.description ?? '',
          isActive: mode.category.isActive,
        }
      : { name: '', slug: '', description: '', isActive: true },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');
  const descriptionValue = watch('description') ?? '';
  const isActiveValue = watch('isActive');

  useEffect(() => {
    if (!slugTouchedRef.current) {
      setValue('slug', slugify(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    setServerFieldErrors({});
    setSavedFlash(false);

    startTransition(async () => {
      const fd = new FormData();
      fd.set('name', values.name);
      fd.set('slug', values.slug);
      if (values.description) fd.set('description', values.description);
      if (imageKey) fd.set('imageKey', imageKey);
      fd.set('isActive', values.isActive ? 'true' : 'false');

      if (isEdit) {
        fd.set('id', mode.category.id);
        const result = await updateCategoryAction(undefined, fd);
        if (result && 'error' in result) {
          setServerError(result.error);
          setServerFieldErrors(result.fieldErrors ?? {});
          return;
        }
        setSavedFlash(true);
        router.refresh();
      } else {
        const result = await createCategoryAction(undefined, fd);
        if (result && 'error' in result) {
          setServerError(result.error);
          setServerFieldErrors(result.fieldErrors ?? {});
          return;
        }
        router.push('/admin/categorias');
        router.refresh();
      }
    });
  });

  const descriptionRemaining = DESCRIPTION_LIMIT - descriptionValue.length;
  const showCounter = descriptionValue.length >= DESCRIPTION_LIMIT * 0.9;
  const slugError = errors.slug?.message ?? serverFieldErrors.slug;
  const nameError = errors.name?.message ?? serverFieldErrors.name;
  const descError = errors.description?.message ?? serverFieldErrors.description;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field htmlFor="image" label="Imagen">
        <ImageUpload
          namespace="categories"
          value={imageKey}
          onChange={setImageKey}
          hint="Toca o arrastra · JPG, PNG, WebP (opcional)"
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
        hint={`Vista previa: /categoria/${slugValue || '...'}`}
      >
        <Input
          id="slug"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
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
        htmlFor="description"
        label="Descripción"
        error={descError}
        hint={
          showCounter
            ? `${descriptionRemaining} caracteres restantes`
            : 'Opcional · aparece en el detalle público'
        }
      >
        <Textarea
          id="description"
          rows={4}
          maxLength={DESCRIPTION_LIMIT + 50}
          disabled={pending}
          aria-invalid={!!descError}
          {...register('description')}
        />
      </Field>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5">
          <div className="flex-1">
            <p className="font-sans text-[14px] font-medium text-fg">
              Categoría activa
            </p>
            <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
              Visible en el catálogo público.
            </p>
          </div>
          <Switch
            checked={isActiveValue}
            onCheckedChange={(checked) =>
              setValue('isActive', checked, { shouldDirty: true })
            }
            disabled={pending}
            aria-label="Activar categoría"
          />
        </label>
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
            : 'Crear categoría'}
      </Button>
    </form>
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
