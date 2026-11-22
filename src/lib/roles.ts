/**
 * WordPress roles the storefront routes on.
 *
 * The plugin puts the user's role slugs in the profile (`roles`). The
 * storefront reads them to decide which dashboard a signed-in person lands on;
 * WordPress still authorizes every request, so these helpers are navigation,
 * not security.
 */

/** Roles that may open `/studio`. Administrators are included so the owner can never lock themselves out. */
export const STAFF_ROLES = ['ns_staff', 'administrator'] as const;

/** Turn an untrusted `roles` value into a list of role slugs. */
export function normalizeRoles(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((role): role is string => typeof role === 'string' && role.length > 0)
    : [];
}

export function isStaff(roles: readonly string[]): boolean {
  return roles.some((role) => (STAFF_ROLES as readonly string[]).includes(role));
}

/** Whether a role set may open a path. Studio is staff-only; the account is customer-only. */
export function canOpenPath(roles: readonly string[], path: string): boolean {
  if (path === '/studio' || path.startsWith('/studio/') || path.startsWith('/studio?')) {
    return isStaff(roles);
  }

  // Staff land in the studio; the account dashboard would bounce them, so
  // sending them there from a login redirect is a wasted trip.
  if (path === '/account' || path.startsWith('/account/') || path.startsWith('/account?')) {
    return !isStaff(roles);
  }

  return true;
}
