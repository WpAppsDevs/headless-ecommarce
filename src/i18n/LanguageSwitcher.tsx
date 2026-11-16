'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useDictionary } from './LocaleProvider';
import { LOCALE_COOKIE, type Locale } from './locales';
import { interpolate } from './interpolate';

const OTHER_LOCALE: Record<Locale, Locale> = { en: 'bn', bn: 'en' };

/** One year; the visitor's language should outlive a browser session. */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

/**
 * Switches the display language.
 *
 * The label shows the language it switches *to*, and carries `lang` for that
 * language so a screen reader pronounces "বাংলা" in Bangla rather than reading
 * Bengali glyphs with an English voice.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const dictionary = useDictionary();
  const router = useRouter();

  const target = OTHER_LOCALE[locale];
  const label = dictionary.common.language[target];

  function switchLanguage() {
    writeLocaleCookie(target);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      lang={target}
      aria-label={interpolate(dictionary.header.switchLanguage, { language: label })}
      className={`relative flex h-9 items-center justify-center rounded-lg border border-brand-border px-2.5 text-xs font-semibold text-brand-text-muted transition-colors after:absolute after:-inset-1 after:content-[""] hover:bg-brand-accent-light hover:text-brand-text focus-brand ${className}`}
    >
      {label}
    </button>
  );
}
