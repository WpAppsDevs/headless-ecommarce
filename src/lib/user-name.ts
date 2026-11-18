/**
 * The customer's name, in one place.
 *
 * Three account surfaces derived a name and an avatar letter on their own, so
 * the rail, the greeting and the settings card could disagree after a profile
 * edit. They all read from here now.
 */

export interface NamedUser {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
}

/** Full name from the parts, then the display name, then the caller's fallback. */
export function personName(user: NamedUser | null | undefined, fallback = ''): string {
  if (!user) return fallback;

  const parts = [user.first_name, user.last_name].filter(
    (part): part is string => !!part && part.trim().length > 0,
  );
  if (parts.length) return parts.join(' ').trim();

  return user.display_name?.trim() || fallback;
}

/**
 * Up to two letters for an avatar: the first letter of each name part.
 *
 * A single word gives a single letter; an empty profile gives the fallback.
 */
export function personInitials(user: NamedUser | null | undefined, fallback = '·'): string {
  const name = personName(user);
  if (!name) return fallback;

  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase() ?? '')
    .join('');

  return letters || fallback;
}
