/**
 * Single source of truth for auth-related route paths.
 * Importable from both Edge (middleware) and Node runtimes.
 */
export const LOGIN_PATH = '/admin/login';
export const ADMIN_PATH = '/admin';

/**
 * Routes under /admin that don't require a session — login + the recovery
 * flow. Authed users get redirected away from these (back into /admin).
 */
export const PUBLIC_AUTH_PATHS = new Set<string>([
  LOGIN_PATH,
  '/admin/forgot-password',
  '/admin/reset-password',
]);

/** True when the path lives under the protected /admin tree. */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.has(pathname);
}
