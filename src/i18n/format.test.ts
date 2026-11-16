import { describe, expect, it } from 'vitest';
import { formatNumber, formatRange, formatTaka, formatYear } from '@/i18n/format';

describe('formatNumber', () => {
  it('groups thousands with Western digits in english', () => {
    expect(formatNumber('en', 1850)).toBe('1,850');
  });

  it('renders Bengali digits in bangla', () => {
    expect(formatNumber('bn', 1850)).toBe('১,৮৫০');
  });

  it('renders a small count as Bengali digits too', () => {
    expect(formatNumber('bn', 3)).toBe('৩');
    expect(formatNumber('en', 3)).toBe('3');
  });
});

describe('formatYear', () => {
  it('never groups a year', () => {
    expect(formatYear('en', 2026)).toBe('2026');
    expect(formatYear('bn', 2026)).toBe('২০২৬');
  });
});

describe('formatRange', () => {
  it('joins the two ends with an en dash', () => {
    expect(formatRange('en', 15, 25)).toBe('15–25');
    expect(formatRange('bn', 15, 25)).toBe('১৫–২৫');
  });
});

describe('formatTaka', () => {
  it('prefixes the taka sign', () => {
    expect(formatTaka('en', 1850)).toBe('৳1,850');
    expect(formatTaka('bn', 1850)).toBe('৳১,৮৫০');
  });
});
