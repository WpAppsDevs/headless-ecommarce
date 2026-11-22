import { describe, expect, it } from 'vitest';
import { normalizeRoles, isStaff, canOpenPath } from '@/lib/roles';

describe('normalizeRoles', () => {
  it('keeps only non-empty strings', () => {
    expect(normalizeRoles(['customer', 'ns_staff'])).toEqual(['customer', 'ns_staff']);
    expect(normalizeRoles(['ns_staff', '', 7, null])).toEqual(['ns_staff']);
  });

  it('treats a missing or wrong-shaped value as no roles', () => {
    expect(normalizeRoles(undefined)).toEqual([]);
    expect(normalizeRoles(null)).toEqual([]);
    expect(normalizeRoles('ns_staff')).toEqual([]);
    expect(normalizeRoles({ role: 'ns_staff' })).toEqual([]);
  });
});

describe('isStaff', () => {
  it('accepts ns_staff and administrator', () => {
    expect(isStaff(['ns_staff'])).toBe(true);
    expect(isStaff(['customer', 'administrator'])).toBe(true);
  });

  it('rejects customers, shop managers and an empty list', () => {
    expect(isStaff(['customer'])).toBe(false);
    expect(isStaff(['shop_manager'])).toBe(false);
    expect(isStaff([])).toBe(false);
  });
});

describe('canOpenPath', () => {
  it('protects only the studio surface', () => {
    expect(canOpenPath(['customer'], '/account')).toBe(true);
    expect(canOpenPath(['customer'], '/checkout')).toBe(true);
    expect(canOpenPath(['customer'], '/studio')).toBe(false);
    expect(canOpenPath(['customer'], '/studio/products/12/edit')).toBe(false);
    expect(canOpenPath(['customer'], '/studio?status=draft')).toBe(false);
    expect(canOpenPath(['ns_staff'], '/studio/products')).toBe(true);
  });

  it('keeps staff out of the account dashboard, which would bounce them anyway', () => {
    expect(canOpenPath(['ns_staff'], '/account')).toBe(false);
    expect(canOpenPath(['administrator'], '/account?tab=orders')).toBe(false);
  });
});
