import type { ReactNode } from 'react';
import type { Locale } from './locales';

/**
 * Picks the copy for a locale, with a key per supported locale.
 *
 * The `Record<Locale, …>` type is the point: adding a third locale turns every
 * call site into a type error instead of silently rendering English.
 */
export function localized(locale: Locale, content: Record<Locale, ReactNode>): ReactNode {
  return content[locale];
}
