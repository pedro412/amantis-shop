import bcrypt from 'bcryptjs';
import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { authConfig } from './auth.config';
import { recordFailure, requireNotRateLimited, resetFailures } from './server/lib/auth-rate-limit';
import { prisma } from './server/lib/prisma';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class InvalidCredentials extends CredentialsSignin {
  override code = 'invalid-credentials';
  override message = 'invalid-credentials';
}

class TooManyAttempts extends CredentialsSignin {
  override code = 'rate-limited';
  override message = 'rate-limited';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) throw new InvalidCredentials();

        const email = parsed.data.email.toLowerCase().trim();

        try {
          requireNotRateLimited(email);
        } catch {
          throw new TooManyAttempts();
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true },
        });

        if (!user) {
          recordFailure(email);
          throw new InvalidCredentials();
        }

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) {
          recordFailure(email);
          throw new InvalidCredentials();
        }

        resetFailures(email);
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
