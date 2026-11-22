'use client';

import { Home, Package, Settings, Heart } from 'lucide-react';
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
import { DashboardShell, type DashboardMenuItem } from '@/components/dashboard/DashboardShell';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { formatNumber } from '@/i18n/format';
import { personInitials, personName } from '@/lib/user-name';

type Tab = 'dashboard' | 'orders' | 'settings' | 'wishlist';

interface AccountLayoutProps {
  profile: UserProfile | null;
  orders: Order[];
}

const MENU: { id: Tab; icon: typeof Home }[] = [
  { id: 'dashboard', icon: Home },
  { id: 'orders', icon: Package },
  { id: 'wishlist', icon: Heart },
  { id: 'settings', icon: Settings },
];

export function AccountLayout({ profile, orders }: AccountLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wishlistCount = useWishlistStore((s) => s.count);
  const dictionary = useDictionary();
  const locale = useLocale();
  const copy = dictionary.account;
  // The badge counts products, so it takes the reading language's digits —
  // a Bengali page showing "4" next to a Bengali heading reads as a bug.
  const wishlistCountLabel = formatNumber(locale, wishlistCount);

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
    normalised && MENU.some((item) => item.id === normalised) ? (normalised as Tab) : 'dashboard';

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
   * place is before the menu says where you can go.
   */
  const trail = (
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

  const menu: DashboardMenuItem[] = MENU.map(({ id, icon }) => ({
    id,
    icon,
    label: copy.tabs[id],
    badge: id === 'wishlist' && wishlistCount > 0 ? wishlistCountLabel : undefined,
  }));

  return (
    <DashboardShell
      surface={copy.breadcrumb}
      navLabel={copy.navLabel}
      identity={{
        initials,
        name: fullName,
        email: profile?.email ?? '',
        emptyEmail: copy.noEmail,
        trail,
      }}
      menu={menu}
      activeId={activeTab}
      onSelect={(id) => selectTab(id as Tab)}
      logoutLabel={copy.logout}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard profile={profile} orders={orders} />}
      {activeTab === 'orders' && <Orders />}
      {activeTab === 'wishlist' && <WishlistTab />}
      {activeTab === 'settings' && <SettingsTab profile={profile} />}
    </DashboardShell>
  );
}
