'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/server/actions/auth';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const justReset = searchParams.get('reset') === 'ok';

  const [serverError, setServerError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('email', values.email);
      fd.set('password', values.password);
      const result = await loginAction(undefined, fd);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-1 flex-col"
    >
      <div className="mt-9 flex flex-col gap-3.5">
        {justReset && (
          <div
            role="status"
            className="rounded-md border border-success/30 bg-success/10 px-3.5 py-3 font-sans text-[13px] text-success"
          >
            Tu contraseña se actualizó. Inicia sesión con la nueva.
          </div>
        )}

        <Field label="Correo" htmlFor="email" error={errors.email?.message}>
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
        </Field>

        <Field
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={pending}
            {...register('password')}
          />
        </Field>

        <a
          href="/admin/forgot-password"
          className="mt-1 self-start font-sans text-[13px] text-primary underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>

        {serverError && (
          <p
            role="alert"
            className="mt-1 font-sans text-[13px] text-destructive"
          >
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
          {pending ? 'Entrando…' : 'Entrar al panel'}
        </Button>
        <p className="mt-3.5 text-center font-sans text-[11px] text-fg-subtle">
          Sesión protegida · Solo personal autorizado
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-sans text-[12px] font-medium tracking-[0.04em] text-fg-muted"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 font-sans text-[12px] text-destructive">{error}</p>
      )}
    </div>
  );
}
