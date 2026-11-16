import { bn } from './bn';
import { en } from './en';
import type { Locale } from './locales';

/**
 * The shape of a message map. `en` is the source of that shape, so a key added
 * to one language and not the other fails typecheck instead of falling back to
 * English at runtime.
 */
export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = { en, bn };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
