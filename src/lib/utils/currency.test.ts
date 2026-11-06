import { describe, expect, it } from 'vitest';
import { formatPrice } from './currency';

const base = {
  symbol: '$',
  position: 'left',
  decimals: 2,
  decimalSep: '.',
  thousandsSep: ',',
};

describe('formatPrice', () => {
  it('formats with thousands and decimals', () => {
    expect(formatPrice(base, 1234.5)).toBe('$1,234.50');
  });

  it('handles every symbol position', () => {
    expect(formatPrice({ ...base, position: 'right' }, 10)).toBe('10.00$');
    expect(formatPrice({ ...base, position: 'left_space' }, 10)).toBe('$ 10.00');
    expect(formatPrice({ ...base, position: 'right_space' }, 10)).toBe('10.00 $');
  });

  it('honours zero decimals', () => {
    expect(formatPrice({ ...base, decimals: 0 }, 1234)).toBe('$1,234');
  });

  it('keeps non-numeric input unchanged', () => {
    expect(formatPrice(base, 'free')).toBe('free');
  });
});
