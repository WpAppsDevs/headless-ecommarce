'use client';

import { Home, Package, Settings, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { UserProfile } from '@/lib/api/checkout';
import type { Order } from '@/lib/api/orders';
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
}

const MENU_ITEMS = [
  { id: 'dashboard' as Tab, icon: Home },
  { id: 'orders' as Tab, icon: Package },
  { id: 'wishlist' as Tab, icon: Heart },
  { id: 'settings' as Tab, icon: Settings },
];

export function AccountLayout({ profile, orders }: AccountLayoutProps) {
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

  /**
   * The trail belongs to the identity block, under the email: it says what this
   * place is before the menu says where you can go, and it reads the same on
   * the mobile band as on the rail.
   */
  const breadcrumb = (
    <nav aria-label={copy.breadcrumbLabel} className="mt-3">
      <ol className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] leading-none text-white/70">
        <li>
          <Link href="/" className="transition-colors hover:text-white">
            {dictionary.common.home}
          </Link>
        </li>
        <li aria-hidden="true" className="select-none text-white/40">
          ›
        </li>
        <li aria-current="page" className="font-medium text-white">
          {copy.breadcrumb}
        </li>
      </ol>
    </nav>
  );

  const wishlistBadge = wishlistCount > 0 && (
    <span
      className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
        activeTab === 'wishlist' ? 'bg-white text-brand-accent-strong' : 'bg-brand-accent-strong text-white'
      }`}
    >
      {wishlistCount}
    </span>
  );

  return (
    <div className="min-h-screen bg-brand-bg font-geist">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <h1 className="sr-only">{copy.breadcrumb}</h1>

        {/*
         * The account canvas. Everything — identity, tabs, rail, cards — sits on
         * one tinted surface, so the page reads as one place rather than a
         * column of white boxes on a white page. The content keeps a floor
         * height so a short tab does not collapse the shell the moment it loads.
         */}
        <div className="rounded-[26px] bg-brand-accent-light p-3 sm:p-4 lg:p-5">
          {/* Mobile: identity band, then the four tabs. The tab row sticks below
              the site header so switching stays available while scrolling. */}
          <div className="lg:hidden">
            <div className="relative rounded-2xl bg-brand-accent-strong px-4 pb-5 pt-6 text-center">
              <button
                type="button"
                onClick={handleLogout}
                aria-label={copy.logout}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-lg font-bold text-white ring-2 ring-white/20"
              >
                {initials}
              </span>
              <p className="mt-2.5 truncate text-[13px] font-bold uppercase text-white">{fullName}</p>
              <p className="mt-0.5 truncate text-xs text-white/65">{profile?.email ?? copy.noEmail}</p>
              {breadcrumb}
            </div>

            <div className="sticky top-24 z-30 mt-2 grid grid-cols-4 gap-1.5 rounded-xl border border-brand-border bg-white p-1.5">
              {MENU_ITEMS.map(({ id, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectTab(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors ${
                      active
                        ? 'bg-brand-accent-strong text-white'
                        : 'bg-brand-bg text-brand-text-muted hover:bg-brand-accent-light hover:text-brand-accent-strong'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                    <span className="text-center">{copy.tabs[id]}</span>
                    {id === 'wishlist' && wishlistCount > 0 && (
                      <span
                        className={`absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
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
          </div>

          {/* Desktop: rail and content share one height, inside the canvas. */}
          <div className="mt-3 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:gap-5">
            <aside className="hidden w-60 shrink-0 self-stretch lg:block">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white">
                {/* Identity, stacked and centred: avatar, name, email. */}
                <div className="bg-brand-accent-strong px-4 pb-6 pt-7 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white ring-2 ring-white/20"
                  >
                    {initials}
                  </span>
                  <p className="mt-3 truncate text-[13px] font-bold uppercase text-white">{fullName}</p>
                  <p className="mt-1 truncate text-xs text-white/65">{profile?.email ?? copy.noEmail}</p>
                  {breadcrumb}
                </div>

                <nav aria-label={copy.navLabel} className="flex-1 space-y-2 p-2.5">
                  {MENU_ITEMS.map(({ id, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectTab(id)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                          active
                            ? 'bg-brand-accent-strong font-semibold text-white shadow-sm'
                            : 'bg-brand-bg font-medium text-brand-text-muted hover:bg-brand-accent-light hover:text-brand-accent-strong'
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                        {copy.tabs[id]}
                        {id === 'wishlist' && wishlistBadge}
                      </button>
                    );
                  })}
                </nav>

                <div className="border-t border-brand-border p-2.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-text"
                  >
                    <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    {copy.logout}
                  </button>
                </div>
              </div>
            </aside>

            <div className="min-h-[480px] min-w-0 flex-1 lg:min-h-[640px]">
              {activeTab === 'dashboard' && <Dashboard profile={profile} orders={orders} />}
              {activeTab === 'orders' && <Orders />}
              {activeTab === 'wishlist' && <WishlistTab />}
              {activeTab === 'settings' && <SettingsTab profile={profile} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
