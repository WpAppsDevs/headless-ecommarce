import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, intlLocale, isLocale, resolveLocale } from '@/i18n/locales';

describe('isLocale', () => {
  it.each([
    ['english', 'en', true],
    ['bangla', 'bn', true],
    ['an unsupported language', 'fr', false],
    ['uppercase, which the cookie is not written in', 'EN', false],
    ['an empty string', '', false],
    ['a region tag', 'bn-BD', false],
    ['a number', 42, false],
    ['undefined', undefined, false],
  ])('%s', (_name, value, expected) => {
    expect(isLocale(value)).toBe(expected);
  });
});

describe('resolveLocale', () => {
  it.each([
    ['a missing cookie', undefined, 'en'],
    ['an empty cookie', '', 'en'],
    ['bangla', 'bn', 'bn'],
    ['english', 'en', 'en'],
    ['an unsupported language', 'fr', 'en'],
    ['a region tag', 'bn-BD', 'en'],
    ['surrounding whitespace', '  bn  ', 'bn'],
    ['uppercase, as some clients send it', 'BN', 'bn'],
  ])('%s resolves to %s', (_name, value, expected) => {
    expect(resolveLocale(value)).toBe(expected);
  });

  it('falls back to the default locale', () => {
    expect(resolveLocale('klingon')).toBe(DEFAULT_LOCALE);
  });
});

describe('locale constants', () => {
  it('supports exactly english and bangla', () => {
    expect(LOCALES).toEqual(['en', 'bn']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('names the cookie the switcher writes', () => {
    expect(LOCALE_COOKIE).toBe('locale');
  });
});

describe('intlLocale', () => {
  it('maps each locale to the Intl tag used for numbers and dates', () => {
    expect(intlLocale('en')).toBe('en');
    expect(intlLocale('bn')).toBe('bn-BD');
  });
});
