'use client';

import { HeaderNavItem } from '@/components/layout/HeaderNavItem';
import type { NavLink } from '@/lib/api/menus';

export function HeaderDesktopNavFallback({ links }: { links: NavLink[] }) {
  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
      {links.map(({ href, label, target }) => (
        <HeaderNavItem key={href} href={href} label={label} target={target} active={false} />
      ))}
    </nav>
  );
}
