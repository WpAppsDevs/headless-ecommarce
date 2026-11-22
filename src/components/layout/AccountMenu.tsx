'use client';

import { Heart, LayoutDashboard, LogOut, Package, Settings, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';
import { AccountMenuList, type AccountMenuItem } from '@/components/layout/AccountMenuList';

/**
 * The storefront account menu.
 *
 * Signed in it is the account's own destinations — the same tabs the account
 * page has, so the header never invents a page; signed out it is the pair of
 * doorways. Sign out sits last, in the danger colour, the way the reference
 * menu does.
 */
export function AccountMenu({ onClose }: { onClose?: () => void }) {
  const { isAuthenticated, logout } = useAuthStore();
  const dictionary = useDictionary();

  if (isAuthenticated) {
    const items: AccountMenuItem[] = [
      { label: dictionary.account.tabs.dashboard, icon: LayoutDashboard, href: '/account' },
      { label: dictionary.header.orders, icon: Package, href: '/account?tab=orders' },
      { label: dictionary.header.wishlist, icon: Heart, href: '/account?tab=wishlist' },
      { label: dictionary.account.tabs.settings, icon: Settings, href: '/account?tab=settings' },
      {
        label: dictionary.header.signOut,
        icon: LogOut,
        tone: 'danger',
        onSelect: () => {
          void logout();
        },
      },
    ];

    return <AccountMenuList items={items} onNavigate={onClose} />;
  }

  const items: AccountMenuItem[] = [
    { label: dictionary.header.signIn, icon: LogIn, href: '/login' },
    { label: dictionary.header.createAccount, icon: UserPlus, href: '/register' },
  ];

  return <AccountMenuList items={items} onNavigate={onClose} />;
}
