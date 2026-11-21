'use client';

import Link from 'next/link';
import { Heart, HelpCircle, Package } from 'lucide-react';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { formatNumber } from '@/i18n/format';
import { config } from '@/lib/config';

interface DashboardShortcutsProps {
  wishlistCount: number;
}

/**
 * The three doors out of the dashboard. Orders is the filled action because it
 * is what most visits are for; the other two are tinted tiles rather than three
 * identical outlines, so the row has a destination instead of a menu.
 */
export function DashboardShortcuts({ wishlistCount }: DashboardShortcutsProps) {
  const copy = useDictionary().account;
  const locale = useLocale();

  const tile =
    'group inline-flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-strong focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:hover:-translate-y-0.5 sm:flex-none';
  const chip =
    'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-200';

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
      <Link
        href="/account?tab=orders"
        className={`${tile} bg-brand-accent-strong text-white hover:bg-brand-accent-strong-hover`}
      >
        <span className={`${chip} bg-white/15 text-white`}>
          <Package className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        {copy.dashboard.shortcutOrders}
      </Link>

      <Link
        href="/account?tab=wishlist"
        className={`${tile} border border-brand-border bg-white text-brand-text hover:border-brand-accent-strong/40 hover:text-brand-accent-strong`}
      >
        <span
          className={`${chip} bg-brand-accent-light text-brand-accent-strong group-hover:bg-brand-accent-strong group-hover:text-white`}
        >
          <Heart className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        {copy.dashboard.shortcutWishlist}
        {wishlistCount > 0 && (
          <span className="ml-auto rounded-full bg-brand-accent-light px-1.5 py-0.5 text-[10px] font-bold text-brand-accent-strong group-hover:bg-brand-accent-light/70">
            {formatNumber(locale, wishlistCount)}
          </span>
        )}
      </Link>

      <a
        href={config.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${tile} col-span-2 border border-brand-border bg-white text-brand-text hover:border-brand-whatsapp/40 hover:text-brand-text sm:col-auto`}
      >
        <span className={`${chip} bg-brand-whatsapp/10 text-brand-whatsapp`}>
          <HelpCircle className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        {copy.dashboard.shortcutSupport}
      </a>
    </div>
  );
}
