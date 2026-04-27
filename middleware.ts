import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

/**
 * Run on /admin/* only — keeps Edge runtime cost off the public catalog.
 * The matcher excludes Next internals and static asset paths.
 */
export const config = {
  matcher: ['/admin/:path*'],
};
