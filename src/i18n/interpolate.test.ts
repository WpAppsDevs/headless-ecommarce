import { describe, expect, it } from 'vitest';
import { interpolate } from '@/i18n/interpolate';

describe('interpolate', () => {
  it('replaces named placeholders', () => {
    expect(interpolate('© {year} {site}.', { year: 2026, site: 'Najifa' })).toBe('© 2026 Najifa.');
  });

  it('replaces every occurrence', () => {
    expect(interpolate('{a} and {a}', { a: 'x' })).toBe('x and x');
  });

  it('leaves an unknown placeholder visible instead of printing undefined', () => {
    expect(interpolate('© {year}', {})).toBe('© {year}');
  });

  it('returns the message untouched when it has no placeholders', () => {
    expect(interpolate('Help', {})).toBe('Help');
  });
});
