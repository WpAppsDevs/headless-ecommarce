import { describe, expect, it } from 'vitest';
import { taxonomyLabel } from './taxonomy';

describe('taxonomyLabel', () => {
  it('translates a known slug for Bangla', () => {
    expect(taxonomyLabel('bn', 'women', 'Women')).toBe('নারী');
    expect(taxonomyLabel('bn', 'pre-order', 'Pre Order')).toBe('প্রি-অর্ডার');
  });

  it('leaves English untouched', () => {
    expect(taxonomyLabel('en', 'women', 'Women')).toBe('Women');
  });

  it('falls back to the API name for an unknown slug', () => {
    expect(taxonomyLabel('bn', 'bridal', 'Bridal')).toBe('Bridal');
  });

  it('falls back when the term has no slug', () => {
    expect(taxonomyLabel('bn', undefined, 'Sale')).toBe('Sale');
  });

  it('matches case-insensitively, because slugs are lowercased upstream but not guaranteed', () => {
    expect(taxonomyLabel('bn', 'Women', 'Women')).toBe('নারী');
  });

  it('keeps sizes that are letters, not words', () => {
    expect(taxonomyLabel('bn', 'xl', 'XL')).toBe('XL');
  });
});
