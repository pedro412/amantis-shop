'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordResetAction } from '@/server/actions/password-reset';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido.'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('email', values.email);
      const result = await requestPasswordResetAction(undefined, fd);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setDone(true);
    });
  });

  if (done) {
    return (
      <div className="mt-9 flex flex-1 flex-col">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="font-sans text-[14px] leading-relaxed text-fg">
            Si esa cuenta existe, te enviamos un correo con instrucciones para
            restablecer la contraseña. Revisa tu bandeja de entrada y la
            carpeta de spam.
          </p>
        </div>
        <div className="mt-auto pt-10">
          <Link
            href="/admin/login"
            className="block w-full rounded-full border border-border bg-bg py-3.5 text-center font-sans text-[15px] font-medium text-fg transition-colors hover:bg-surface-alt"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-1 flex-col"
    >
      <div className="mt-9 flex flex-col gap-3.5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block font-sans text-[12px] font-medium tracking-[0.04em] text-fg-muted"
          >
            Correo
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1.5 font-sans text-[12px] text-destructive">
              {errors.email.message}
            </p>
          )}
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

        <Link
          href="/admin/login"
          className="mt-1 self-start font-sans text-[13px] text-primary underline-offset-4 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>

      <div className="mt-auto pt-10">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full tracking-normal"
          disabled={pending}
        >
          {pending ? 'Enviando…' : 'Enviar instrucciones'}
        </Button>
        <p className="mt-3.5 text-center font-sans text-[11px] text-fg-subtle">
          Solo enviamos correos a cuentas registradas
        </p>
      </div>
    </form>
  );
}
