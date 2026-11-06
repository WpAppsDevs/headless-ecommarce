'use client';

import { HeaderNavItem } from '@/components/layout/HeaderNavItem';
import type { NavLink } from '@/lib/api/menus';

export function HeaderMobileNavFallback({
  links,
  onClick,
}: {
  links: NavLink[];
  onClick?: () => void;
}) {
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
          active={false}
        />
      ))}
    </>
  );
}
