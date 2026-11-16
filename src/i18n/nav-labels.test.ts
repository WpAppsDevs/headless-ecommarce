import { describe, expect, it } from 'vitest';
import { localizeNavLinks } from '@/i18n/nav-labels';
import { en } from '@/i18n/en';
import { bn } from '@/i18n/bn';
import type { NavLink } from '@/lib/api/menus';

const links: NavLink[] = [
  { href: '/', label: 'HOME', target: '_self' },
  { href: '/products?tag=ready-stock', label: 'READY STOCK', target: '_self' },
  { href: '/products?tag=pre-order', label: 'PRE-ORDER', target: '_self' },
  { href: '/products?tag=catalog', label: 'CATALOG / WHOLESALE', target: '_self' },
  { href: '/contact', label: 'CONTACT', target: '_self' },
];

function labelFor(translated: NavLink[], href: string) {
  return translated.find((link) => link.href === href)?.label;
}

describe('localizeNavLinks', () => {
  it('translates the collection destinations', () => {
    const translated = localizeNavLinks(links, bn);

    expect(labelFor(translated, '/')).toBe('হোম');
    expect(labelFor(translated, '/products?tag=ready-stock')).toBe('রেডি স্টক');
    expect(labelFor(translated, '/products?tag=pre-order')).toBe('প্রি-অর্ডার');
    expect(labelFor(translated, '/products?tag=catalog')).toBe('ক্যাটালগ / হোলসেল');
  });

  it('keeps a destination with no translated page on its own label', () => {
    expect(labelFor(localizeNavLinks(links, bn), '/contact')).toBe('CONTACT');
  });

  it('keeps an unknown WordPress destination on its own label', () => {
    const translated = localizeNavLinks(
      [{ href: '/wholesale', label: 'Wholesale', target: '_self' }],
      bn,
    );

    expect(translated[0].label).toBe('Wholesale');
  });

  it('does not mutate the links it was given', () => {
    const original = [...links];
    localizeNavLinks(links, bn);

    expect(links).toEqual(original);
  });

  it('returns the english labels in english', () => {
    expect(labelFor(localizeNavLinks(links, en), '/')).toBe(en.header.nav.home);
  });
});
