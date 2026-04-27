'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPasswordAction } from '@/server/actions/password-reset';

const schema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

export function ResetForm({ token }: { token: string }) {
  const [serverError, setServerError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('token', token);
      fd.set('password', values.password);
      const result = await resetPasswordAction(undefined, fd);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
      <div className="mt-9 flex flex-col gap-3.5">
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-sans text-[12px] font-medium tracking-[0.04em] text-fg-muted"
          >
            Nueva contraseña
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={pending}
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1.5 font-sans text-[12px] text-destructive">
              {errors.password.message}
            </p>
          )}
          <p className="mt-2 font-sans text-[12px] text-fg-subtle">
            Mínimo 8 caracteres.
          </p>
        </div>

        {serverError && (
          <p role="alert" className="font-sans text-[13px] text-destructive">
            {serverError}
          </p>
        )}
      </div>

      <div className="mt-auto pt-10">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full tracking-normal"
          disabled={pending}
        >
          {pending ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
        <p className="mt-3.5 text-center font-sans text-[11px] text-fg-subtle">
          Después de guardar tendrás que iniciar sesión de nuevo
        </p>
      </div>
    </form>
  );
}
