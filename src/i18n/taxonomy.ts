import type { Locale } from './locales';

/**
 * Bangla names for the shop's taxonomy terms, keyed by slug.
 *
 * WordPress owns these names and has no multilingual fields, but it also sends
 * each term's slug — and a slug is a stable identifier, not copy. So the label a
 * visitor reads comes from here while the data stays untouched: `women` still
 * means `Women` in WooCommerce, and the filter link keeps working in both
 * languages.
 *
 * An unknown slug falls back to the name WooCommerce sent, so a new category
 * appears in English rather than disappearing or rendering `undefined`.
 */
const BANGLA_BY_SLUG: Record<string, string> = {
  // Categories
  women: 'নারী',
  men: 'পুরুষ',
  kids: 'শিশু',
  uncategorized: 'অন্যান্য',

  // Tags
  'pre-order': 'প্রি-অর্ডার',
  'ready-stock': 'রেডি স্টক',

  // Colour terms, in case the attribute list is populated
  red: 'লাল',
  blue: 'নীল',
  green: 'সবুজ',
  black: 'কালো',
  white: 'সাদা',
  pink: 'গোলাপি',
  beige: 'বেইজ',
  maroon: 'মেরুন',
  navy: 'নেভি',
  gold: 'সোনালি',
  brown: 'বাদামি',
  purple: 'বেগুনি',
  yellow: 'হলুদ',
  grey: 'ধূসর',
  gray: 'ধূসর',
  orange: 'কমলা',
};

/** The label to show for a taxonomy term, in the visitor's language. */
export function taxonomyLabel(locale: Locale, slug: string | undefined, fallback: string): string {
  if (locale === 'en' || !slug) return fallback;
  return BANGLA_BY_SLUG[slug.toLowerCase()] ?? fallback;
}

/** A term object as the API sends it: a display name plus a stable slug. */
export interface TaxonomyTerm {
  name: string;
  slug: string;
}

export function labelledTerms<T extends TaxonomyTerm>(locale: Locale, terms: T[]): Array<T & { label: string }> {
  return terms.map((term) => ({ ...term, label: taxonomyLabel(locale, term.slug, term.name) }));
}
