'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from './locales';
import { getDictionary, type Dictionary } from './get-dictionary';

const LocaleContext = createContext<Locale | null>(null);

/**
 * Hands the server-resolved locale to client components.
 *
 * The cookie is the source of truth; this exists because a client component
 * cannot read it without turning into a second, possibly stale, copy.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const locale = useContext(LocaleContext);

  if (locale === null) {
    throw new Error('useLocale must be called inside a <LocaleProvider>.');
  }

  return locale;
}

/** The message map for the current locale, for client components. */
export function useDictionary(): Dictionary {
  return getDictionary(useLocale());
}
