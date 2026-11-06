'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { isNavLinkActive } from '@/lib/navigation';
import { HeaderNavItem } from '@/components/layout/HeaderNavItem';
import type { NavLink } from '@/lib/api/menus';

export function HeaderDesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
      {links.map(({ href, label, target }) => (
        <HeaderNavItem
          key={href}
          href={href}
          label={label}
          target={target}
          active={isNavLinkActive(pathname, searchParams, href)}
        />
      ))}
    </nav>
  );
}
