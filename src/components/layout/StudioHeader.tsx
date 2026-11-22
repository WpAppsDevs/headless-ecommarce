'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Store, User } from 'lucide-react';
import { SiteLogo } from '@/components/layout/SiteLogo';
import {
  AccountMenuList,
  accountMenuPanel,
  type AccountMenuItem,
} from '@/components/layout/AccountMenuList';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';

const ICON_CLASS =
  'relative flex h-9 w-9 items-center justify-center rounded-lg text-brand-text-muted transition-colors hover:bg-brand-accent-light hover:text-brand-text focus-brand';

/**
 * The studio's header: the shop's wordmark, the language switch, and the
 * account menu.
 *
 * Deliberately stripped — no menu, search, cart or wishlist icons, because
 * those are storefront jobs and the dashboard has its own navigation. The
 * account menu is staff-shaped: dashboard, shop, sign out.
 */
export function StudioHeader() {
  const router = useRouter();
  const dictionary = useDictionary();
  const copy = dictionary.staff;
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const items: AccountMenuItem[] = [
    { label: copy.nav.dashboard, icon: LayoutDashboard, href: '/studio' },
    { label: copy.viewShop, icon: Store, href: '/' },
    {
      label: copy.signOut,
      icon: LogOut,
      tone: 'danger',
      onSelect: () => {
        void logout().then(() => router.replace('/login'));
      },
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <SiteLogo />

        <div className="flex items-center gap-1">
          <LanguageSwitcher />

          <div className="relative" ref={ref}>
            <button
              type="button"
              aria-label={dictionary.header.account}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className={ICON_CLASS}
            >
              <User className="h-5 w-5" strokeWidth={1.8} />
            </button>

            {open && (
              <nav
                aria-label={dictionary.header.account}
                className={`absolute right-0 top-full z-50 mt-2 w-60 ${accountMenuPanel}`}
              >
                <AccountMenuList items={items} onNavigate={() => setOpen(false)} />
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
