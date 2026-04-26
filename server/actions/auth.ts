'use server';

import { AuthError } from 'next-auth';
import { z } from 'zod';

import { signIn } from '@/auth';
import { ADMIN_PATH } from '@/server/lib/auth-routes';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Revisa los campos e intenta de nuevo.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: ADMIN_PATH,
    });
    return undefined;
  } catch (err) {
    // signIn throws a NEXT_REDIRECT on success — let it propagate.
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: unknown }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err;
    }

    if (err instanceof AuthError) {
      const code = (err as { code?: string }).code;
      if (code === 'rate-limited') {
        return {
          error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.',
        };
      }
      return { error: 'Correo o contraseña incorrectos.' };
    }

    throw err;
  }
}
