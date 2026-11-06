'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function HeaderNavItem({
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
          : 'text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap transition-colors',
        active ? 'text-brand-wine' : 'text-brand-text-muted hover:text-brand-wine',
      )}
    >
      {label}
    </Link>
  );
}
