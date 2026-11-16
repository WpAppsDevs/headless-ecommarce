'use client';

import { HeaderNavItem } from '@/components/layout/HeaderNavItem';
import type { NavLink } from '@/lib/api/menus';
import { useDictionary } from '@/i18n/LocaleProvider';

export function HeaderDesktopNavFallback({ links }: { links: NavLink[] }) {
  const copy = useDictionary().common;

  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label={copy.mainNavigation}>
      {links.map(({ href, label, target }) => (
        <HeaderNavItem key={href} href={href} label={label} target={target} active={false} />
      ))}
    </nav>
  );
}
