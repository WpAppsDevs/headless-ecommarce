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
 * Drawn rather than typed as an emoji: flag emoji depend on a platform font,
 * and Windows renders them as the letters "BD"/"GB" while a container or CI
 * image can render them as an empty box.
 */
function BanglaFlag() {
  return (
    <svg viewBox="0 0 28 20" className="h-4 w-[22px] rounded-[2px]" aria-hidden="true">
      <rect width="28" height="20" fill="#006A4E" />
      <circle cx="11.5" cy="10" r="6" fill="#F42A41" />
    </svg>
  );
}

function EnglishFlag() {
  return (
    <svg viewBox="0 0 28 20" className="h-4 w-[22px] rounded-[2px]" aria-hidden="true">
      <rect width="28" height="20" fill="#012169" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="6.6" />
      <path d="M14 0v20M0 10h28" stroke="#C8102E" strokeWidth="4" />
    </svg>
  );
}

/**
 * Switches the display language, showing the flag of the language it switches
 * *to*.
 *
 * The flag is decorative to assistive technology, so the accessible name
 * carries the full phrase ("Switch language to বাংলা") and `lang` sets the
 * pronunciation of the language name inside it.
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
      className={`relative flex h-9 w-11 items-center justify-center rounded-lg border border-brand-border transition-colors after:absolute after:-inset-1 after:content-[""] hover:bg-brand-accent-light focus-brand ${className}`}
    >
      {target === 'bn' ? <BanglaFlag /> : <EnglishFlag />}
    </button>
  );
}
