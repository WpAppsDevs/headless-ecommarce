import { canOpenPath, isStaff } from '@/lib/roles';

/**
 * Where a sign-in should land.
 *
 * A `?redirect=` value wins over the role default only when it points inside
 * this site and the role may open it. Everything else falls back to the
 * role's home, so a customer link sent to staff lands in the studio rather
 * than bouncing between the two dashboards.
 */
export function resolveLanding({
  roles,
  redirect,
}: {
  roles: readonly string[];
  redirect?: string | null;
}): string {
  if (redirect && isSafeRedirect(redirect) && canOpenPath(roles, redirect)) {
    return redirect;
  }

  return isStaff(roles) ? '/studio' : '/account';
}

/**
 * Only a single-slash internal path is a redirect target.
 *
 * Rejects protocol-relative URLs (`//evil.example`), absolute URLs
 * (`https://…`), `javascript:` and backslash tricks that browsers normalise
 * into a host.
 */
export function isSafeRedirect(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//')) return false;
  if (value.includes('\\')) return false;
  return !/[\u0000-\u001f]/.test(value);
}
