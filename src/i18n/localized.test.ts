import { describe, expect, it } from 'vitest';
import { localized } from '@/i18n/localized';

describe('localized', () => {
  it('returns the entry for the requested locale', () => {
    expect(localized('bn', { en: 'Shipping', bn: 'শিপিং' })).toBe('শিপিং');
    expect(localized('en', { en: 'Shipping', bn: 'শিপিং' })).toBe('Shipping');
  });
});
