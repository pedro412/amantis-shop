import type { NextAuthConfig } from 'next-auth';

import {
  ADMIN_PATH,
  LOGIN_PATH,
  isAdminPath,
  isPublicAuthPath,
} from '@/server/lib/auth-routes';

/**
 * Edge-safe Auth.js config.
 *
 * Used by `middleware.ts` (which runs on the Edge runtime where Node-only
 * deps like bcrypt and Prisma can't be imported). The full config in
 * `auth.ts` extends this with the Credentials provider's `authorize`
 * function — which only runs in the Node API route, never in middleware.
 */
export const authConfig = {
  pages: {
    signIn: LOGIN_PATH,
  },
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const onAdmin = isAdminPath(nextUrl.pathname);
      const onPublicAuth = isPublicAuthPath(nextUrl.pathname);

      if (onPublicAuth && isLoggedIn) {
        return Response.redirect(new URL(ADMIN_PATH, nextUrl));
      }
      if (onAdmin && !onPublicAuth && !isLoggedIn) {
        return false; // triggers redirect to LOGIN_PATH (per `pages.signIn`)
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
