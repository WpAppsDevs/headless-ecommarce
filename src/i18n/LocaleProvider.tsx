'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from './locales';
import type { Dictionary } from './get-dictionary';

const LocaleContext = createContext<{ locale: Locale; dictionary: Dictionary } | null>(null);

/**
 * Hands the server-resolved locale and its dictionary to client components.
 *
 * The dictionary is passed in rather than looked up here so a client component
 * never pulls both languages into its bundle; the server already knows which
 * one this request needs.
 */
export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>{children}</LocaleContext.Provider>
  );
}

function useLocaleContext() {
  const value = useContext(LocaleContext);

  if (value === null) {
    throw new Error('useLocale must be called inside a <LocaleProvider>.');
  }

  return value;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

/** The message map for the current locale, for client components. */
export function useDictionary(): Dictionary {
  return useLocaleContext().dictionary;
}
