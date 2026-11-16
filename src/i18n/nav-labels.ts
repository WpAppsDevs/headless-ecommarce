import type { NavLink } from '@/lib/api/menus';
import type { Dictionary } from './get-dictionary';

/**
 * Which dictionary key names each known nav destination.
 *
 * WordPress owns the menu, so a label can arrive from the CMS. Only the
 * destinations we actually have translated copy for are listed; anything else
 * keeps the WordPress label rather than showing an English word in Bangla.
 * `/contact` is deliberately absent: the page is English-only this phase.
 */
const NAV_LABEL_KEYS: Record<string, keyof Dictionary['header']['nav']> = {
  '/': 'home',
  '/products?tag=ready-stock': 'readyStock',
  '/products?tag=pre-order': 'preOrder',
  '/products?tag=catalog': 'catalog',
};

export function localizeNavLinks(links: NavLink[], dictionary: Dictionary): NavLink[] {
  return links.map((link) => {
    const key = NAV_LABEL_KEYS[link.href];
    return key ? { ...link, label: dictionary.header.nav[key] } : link;
  });
}
