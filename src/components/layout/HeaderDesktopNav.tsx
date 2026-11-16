'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { isNavLinkActive } from '@/lib/navigation';
import { HeaderNavItem } from '@/components/layout/HeaderNavItem';
import { useDictionary } from '@/i18n/LocaleProvider';
import type { NavLink } from '@/lib/api/menus';

export function HeaderDesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dictionary = useDictionary();

  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label={dictionary.header.mainNav}>
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
