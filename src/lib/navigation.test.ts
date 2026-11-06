import { describe, expect, it } from 'vitest';
import { buildShopFilterHref, buildShopHref, clearShopFilters, isNavLinkActive } from '@/lib/navigation';

function search(value = ''): URLSearchParams {
  return new URLSearchParams(value);
}

describe('isNavLinkActive', () => {
  it.each([
    ['home on the home page', '/', '', '/', true],
    ['home away from home', '/products', '', '/', false],
    ['ready stock', '/products', 'tag=ready-stock', '/products?tag=ready-stock', true],
    ['ready stock with pagination', '/products', 'tag=ready-stock&page=2', '/products?tag=ready-stock', true],
    ['ready stock is not pre-order', '/products', 'tag=pre-order', '/products?tag=ready-stock', false],
    ['pre-order', '/products', 'tag=pre-order', '/products?tag=pre-order', true],
    ['catalog', '/products', 'tag=catalog', '/products?tag=catalog', true],
    ['a collection link needs its tag', '/products', '', '/products?tag=ready-stock', false],
    ['a product detail is not a collection', '/products/a12', 'tag=ready-stock', '/products?tag=ready-stock', false],
    ['all products is not active on a collection', '/products', 'tag=ready-stock', '/products', false],
    ['all products is not active on a product detail', '/products/a12', '', '/products', false],
    ['contact', '/contact', '', '/contact', true],
    ['a contact subpage', '/contact/help', '', '/contact', true],
    ['a contact anchor', '/contact', '', '/contact#form', true],
    ['an external link', '/products', '', 'https://example.com', false],
  ])('%s', (_name, pathname, params, href, expected) => {
    expect(isNavLinkActive(pathname, search(params), href)).toBe(expected);
  });
});

describe('buildShopFilterHref', () => {
  it('omits the first page and empty filters', () => {
    expect(buildShopFilterHref({ page: 1, category: null, tag: null })).toBe('/products');
  });

  it('carries the collection filters and the requested page', () => {
    expect(
      buildShopFilterHref({
        page: 2,
        category: 'women',
        tag: 'ready-stock',
        brand: 'najifa',
        search: 'dress',
      }),
    ).toBe('/products?page=2&category=women&tag=ready-stock&brand=najifa&search=dress');
  });
});

describe('clearShopFilters', () => {
  it('removes every shop filter and returns the catalog root', () => {
    const current = search(
      'tag=ready-stock&category=women&brand=najifa&search=dress&page=2&price=100&color=red&colour=blue&size=m',
    );
    const cleared = clearShopFilters(current);

    expect(cleared.toString()).toBe('');
    expect(buildShopHref(cleared)).toBe('/products');
  });

  it('returns the catalog root for a URL with no filters', () => {
    const cleared = clearShopFilters(search());

    expect(cleared.toString()).toBe('');
    expect(buildShopHref(cleared)).toBe('/products');
  });

  it('keeps unrelated parameters', () => {
    const cleared = clearShopFilters(search('tag=pre-order&sort=price-asc'));

    expect(cleared.get('tag')).toBeNull();
    expect(cleared.get('sort')).toBe('price-asc');
    expect(buildShopHref(cleared)).toBe('/products?sort=price-asc');
  });
});
