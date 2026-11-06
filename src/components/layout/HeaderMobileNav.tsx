'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { isNavLinkActive } from '@/lib/navigation';
import { HeaderNavItem } from '@/components/layout/HeaderNavItem';
import type { NavLink } from '@/lib/api/menus';

export function HeaderMobileNav({
  links,
  onClick,
}: {
  links: NavLink[];
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {links.map(({ href, label, target }) => (
        <HeaderNavItem
          key={href}
          href={href}
          label={label}
          target={target}
          onClick={onClick}
          mobile
          active={isNavLinkActive(pathname, searchParams, href)}
        />
      ))}
    </>
  );
}
