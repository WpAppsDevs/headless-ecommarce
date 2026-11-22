import { describe, expect, it } from 'vitest';
import { isSafeRedirect, resolveLanding } from '@/lib/login-redirect';

const staff = ['customer', 'ns_staff'];
const owner = ['administrator'];
const customer = ['customer'];
const noRoles: string[] = [];

describe('resolveLanding', () => {
  it('sends staff and owners to the studio by default', () => {
    expect(resolveLanding({ roles: staff })).toBe('/studio');
    expect(resolveLanding({ roles: owner })).toBe('/studio');
  });

  it('sends everyone else to the account', () => {
    expect(resolveLanding({ roles: customer })).toBe('/account');
    expect(resolveLanding({ roles: noRoles })).toBe('/account');
  });

  it('honours a redirect both roles may open', () => {
    for (const roles of [staff, customer]) {
      expect(resolveLanding({ roles, redirect: '/checkout' })).toBe('/checkout');
      expect(resolveLanding({ roles, redirect: '/wishlist?from=cart' })).toBe('/wishlist?from=cart');
    }
  });

  it('lets staff keep their requested studio page', () => {
    expect(resolveLanding({ roles: staff, redirect: '/studio/products' })).toBe(
      '/studio/products',
    );
  });

  it('drops a redirect the role may not open', () => {
    expect(resolveLanding({ roles: customer, redirect: '/studio' })).toBe('/account');
    expect(resolveLanding({ roles: customer, redirect: '/studio/products/12/edit' })).toBe(
      '/account',
    );
  });

  it('drops an account redirect for staff and lands in the studio', () => {
    expect(resolveLanding({ roles: staff, redirect: '/account?tab=orders' })).toBe('/studio');
  });

  it('ignores an unsafe redirect', () => {
    for (const redirect of ['//evil.example', 'https://evil.example', 'javascript:alert(1)']) {
      expect(resolveLanding({ roles: customer, redirect })).toBe('/account');
      expect(resolveLanding({ roles: staff, redirect })).toBe('/studio');
    }
  });
});

describe('isSafeRedirect', () => {
  it('accepts internal paths', () => {
    expect(isSafeRedirect('/account')).toBe(true);
    expect(isSafeRedirect('/checkout?step=2')).toBe(true);
    expect(isSafeRedirect('/')).toBe(true);
  });

  it('rejects anything that could leave the site', () => {
    expect(isSafeRedirect('')).toBe(false);
    expect(isSafeRedirect('account')).toBe(false);
    expect(isSafeRedirect('//evil.example')).toBe(false);
    expect(isSafeRedirect('/\\evil.example')).toBe(false);
    expect(isSafeRedirect('http://evil.example')).toBe(false);
    expect(isSafeRedirect('javascript:alert(1)')).toBe(false);
    expect(isSafeRedirect('/account\nSet-Cookie: x')).toBe(false);
  });
});
