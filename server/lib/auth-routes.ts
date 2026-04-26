/**
 * Single source of truth for auth-related route paths.
 * Importable from both Edge (middleware) and Node runtimes.
 */
export const LOGIN_PATH = '/admin/login';
export const ADMIN_PATH = '/admin';

/** Routes that authed users get redirected away from. */
export const PUBLIC_AUTH_PATHS = new Set<string>([LOGIN_PATH, '/admin/forgot-password']);

/** True when the path lives under the protected /admin tree. */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}
