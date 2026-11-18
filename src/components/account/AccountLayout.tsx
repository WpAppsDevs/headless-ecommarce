'use client';

import { Home, Package, Settings, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { UserProfile } from '@/lib/api/checkout';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { Dashboard } from './Dashboard';
import { Orders } from './Orders';
import { SettingsTab } from './Settings';
import { WishlistTab } from './Wishlist';
import { useDictionary } from '@/i18n/LocaleProvider';
import { personInitials, personName } from '@/lib/user-name';

type Tab = 'dashboard' | 'orders' | 'settings' | 'wishlist';

interface AccountLayoutProps {
  profile: UserProfile | null;
  orders: Order[];
  ordersMeta: OrdersMeta;
}

const MENU_ITEMS = [
  { id: 'dashboard' as Tab, icon: Home },
  { id: 'orders' as Tab, icon: Package },
  { id: 'wishlist' as Tab, icon: Heart },
  { id: 'settings' as Tab, icon: Settings },
];

export function AccountLayout({ profile, orders, ordersMeta }: AccountLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wishlistCount = useWishlistStore((s) => s.count);
  const dictionary = useDictionary();
  const copy = dictionary.account;

  /**
   * The tab lives in the URL, so a refresh keeps it, the browser's Back button
   * returns to the previous tab, and `/account?tab=orders` is a link a customer
   * can be sent. `replace` keeps the history clean: five tabs are five views of
   * one page, not five pages.
   *
   * `address` was an old tab of its own; the addresses now live inside
   * settings, and an old shared link still lands somewhere sensible.
   */
  const requested = searchParams.get('tab');
  const normalised = requested === 'address' ? 'settings' : requested;
  const activeTab: Tab =
    normalised && MENU_ITEMS.some((item) => item.id === normalised) ? (normalised as Tab) : 'dashboard';

  /**
   * Keep the current tab visible. Four pills are wider than a phone, and the
   * active one could sit half off-screen when the tab came from a deep link.
   */
  const activePillRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activePillRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }, [activeTab]);

  const selectTab = (tab: Tab) => {
    if (tab === activeTab) return;
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const fullName = personName(profile, copy.customer);
  const initials = personInitials(profile, '·');

  const wishlistBadge = wishlistCount > 0 && (
    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-accent-strong px-1.5 text-[10px] font-bold text-white">
      {wishlistCount}
    </span>
  );

  return (
    <div className="min-h-screen bg-brand-bg font-geist">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <h1 className="sr-only">{copy.breadcrumb}</h1>

        <nav aria-label={copy.breadcrumbLabel} className="mb-4">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-brand-text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-brand-text">
                {dictionary.common.home}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none text-brand-border">
              ›
            </li>
            <li aria-current="page" className="font-medium text-brand-text">
              {copy.breadcrumb}
            </li>
          </ol>
        </nav>

        {/* Mobile tab bar — sticky under the 68px header, horizontal scroll */}
        <div className="sticky top-24 z-30 mb-2 flex snap-x gap-1 overflow-x-auto rounded-xl border border-brand-border bg-white p-1 lg:hidden">
          {MENU_ITEMS.map(({ id, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                ref={active ? activePillRef : undefined}
                type="button"
                onClick={() => selectTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-brand-accent-strong text-white'
                    : 'text-brand-text-muted hover:bg-brand-bg hover:text-brand-text'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                {copy.tabs[id]}
                {id === 'wishlist' && wishlistCount > 0 && (
                  <span
                    className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                      active ? 'bg-white/25 text-white' : 'bg-brand-accent-strong text-white'
                    }`}
                  >
                    {wishlistCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sign-out sits apart from the tabs: it leaves the account, the tabs move inside it. */}
        <div className="mb-4 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 text-xs font-medium text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-text"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
            {copy.logout}
          </button>
        </div>

        {/* Desktop two-column layout — both columns share the same height */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Full-height rail: identity on top, menu in the middle, sign-out at the bottom */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white">
              <div className="flex items-center gap-3 border-b border-brand-border px-4 py-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent-light text-sm font-bold text-brand-accent-strong"
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-text">{fullName}</p>
                  <p className="truncate text-xs text-brand-text-muted">
                    {profile?.email ?? copy.noEmail}
                  </p>
                </div>
              </div>

              <nav aria-label={copy.navLabel} className="flex-1 p-2">
                {MENU_ITEMS.map(({ id, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectTab(id)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-brand-accent-light font-semibold text-brand-accent-strong'
                          : 'font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text'
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-brand-accent-strong"
                        />
                      )}
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                      {copy.tabs[id]}
                      {id === 'wishlist' && wishlistBadge}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-brand-border p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-text"
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                  {copy.logout}
                </button>
              </div>
            </div>
          </aside>

          {/* Content — a div, not a second <main>: the root layout owns the landmark. */}
          <div className="min-w-0 flex-1">
            <div className="h-full rounded-2xl bg-brand-accent-light p-3 sm:p-4 lg:p-5">
              {activeTab === 'dashboard' && <Dashboard profile={profile} orders={orders} />}
              {activeTab === 'orders' && <Orders orders={orders} meta={ordersMeta} />}
              {activeTab === 'wishlist' && <WishlistTab />}
              {activeTab === 'settings' && <SettingsTab profile={profile} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
