import { intlLocale, type Locale } from './locales';

/**
 * Formats a number for the reading language.
 *
 * `bn-BD` renders Bengali digits (১৮৫০ → ১,৮৫০) and `en` renders Western
 * ones, so a price or a count never disagrees with the copy around it.
 */
export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

/** A taka amount, e.g. `৳1,850` or `৳১,৮৫০`. */
export function formatTaka(locale: Locale, value: number): string {
  return `৳${formatNumber(locale, value)}`;
}

/** A year, never grouped: `2026`, not `2,026`. */
export function formatYear(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocale(locale), { useGrouping: false }).format(value);
}
