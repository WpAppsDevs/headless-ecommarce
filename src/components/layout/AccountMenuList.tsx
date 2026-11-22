'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/**
 * One row of the account menu.
 *
 * `href` makes the row a link, `onSelect` a button (sign out); `tone` only
 * exists so the destructive row can be red without a second component.
 */
export interface AccountMenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
  tone?: 'danger';
}

/** The card the rows sit in: hairline border, full-width dividers, one shadow. */
export const accountMenuPanel =
  'overflow-hidden rounded-xl border border-brand-border bg-white shadow-md';

const ROW_CLASS =
  'flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors focus-brand';

/**
 * Rows of the account menu, separated by hairlines.
 *
 * Shared by the storefront header, the mobile sheet and the studio header, so
 * the three read as the same menu. The wrapper owns the dividers, which is why
 * a row carries no border of its own.
 */
export function AccountMenuList({
  items,
  onNavigate,
}: {
  items: AccountMenuItem[];
  onNavigate?: () => void;
}) {
  return (
    <div className="divide-y divide-brand-border">
      {items.map(({ label, icon: Icon, href, onSelect, tone }) => {
        const toneClass =
          tone === 'danger'
            ? 'text-brand-danger hover:bg-brand-danger/5'
            : 'text-brand-text hover:bg-brand-accent-light';

        const content = (
          <>
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                tone === 'danger' ? 'text-brand-danger' : 'text-brand-accent-strong'
              }`}
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span>{label}</span>
          </>
        );

        if (href) {
          return (
            <Link
              key={label}
              href={href}
              onClick={onNavigate}
              className={`${ROW_CLASS} ${toneClass}`}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={label}
            type="button"
            onClick={() => {
              onNavigate?.();
              onSelect?.();
            }}
            className={`${ROW_CLASS} ${toneClass}`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
