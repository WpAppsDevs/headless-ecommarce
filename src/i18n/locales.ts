/**
 * The display languages the storefront supports.
 *
 * The locale is a UI preference stored in a cookie, never in the URL. See
 * `docs/adr/0008-locale-cookie-not-url.md`.
 */
export const LOCALES = ['en', 'bn'] as const;

export type Locale = (typeof LOCALES)[number];

/** What a visitor with no cookie gets, and therefore what a crawler sees. */
export const DEFAULT_LOCALE: Locale = 'en';

/** The cookie the language switcher writes and the root layout reads. */
export const LOCALE_COOKIE = 'locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Turns a raw cookie value into a supported locale.
 *
 * Cookie values are arbitrary strings a client can send, so an unknown or
 * malformed value must resolve to the default rather than break rendering.
 */
export function resolveLocale(value: string | null | undefined): Locale {
  const normalized = value?.trim().toLowerCase();
  return isLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

/** The tag passed to `Intl` so numbers and dates follow the reading language. */
export function intlLocale(locale: Locale): string {
  return locale === 'bn' ? 'bn-BD' : 'en';
}
