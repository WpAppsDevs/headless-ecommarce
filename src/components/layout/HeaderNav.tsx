'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isNavLinkActive } from '@/lib/navigation';
import type { NavLink } from '@/lib/api/menus';

function NavItem({
  href,
  label,
  target,
  active,
  mobile = false,
  onClick,
}: {
  href: string;
  label: string;
  target: string;
  active: boolean;
  mobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={cn(
        mobile
          ? 'text-sm font-medium transition-colors'
          : 'text-[11px] font-semibold tracking-[0.08em] transition-colors whitespace-nowrap',
        active ? 'text-brand-wine' : 'text-zinc-700 hover:text-brand-wine',
      )}
    >
      {label}
    </Link>
  );
}

export function DesktopNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
      {links.map(({ href, label, target }) => (
        <NavItem
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

export function DesktopNavFallback({ links }: { links: NavLink[] }) {
  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
      {links.map(({ href, label, target }) => (
        <NavItem key={href} href={href} label={label} target={target} active={false} />
      ))}
    </nav>
  );
}

export function MobileNavLinks({ links, onClick }: { links: NavLink[]; onClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {links.map(({ href, label, target }) => (
        <NavItem
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

export function MobileNavFallback({ links, onClick }: { links: NavLink[]; onClick?: () => void }) {
  return (
    <>
      {links.map(({ href, label, target }) => (
        <NavItem
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
