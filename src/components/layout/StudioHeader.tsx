'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { SiteLogo } from '@/components/layout/SiteLogo';
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-brand-border bg-white p-3 shadow-xl">
                <div className="flex flex-col gap-2">
                  <Link
                    href="/studio"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-brand-text transition-colors hover:text-brand-accent-strong"
                  >
                    {copy.nav.dashboard}
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="text-sm text-brand-text-muted transition-colors hover:text-brand-text"
                  >
                    {copy.viewShop}
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      await logout();
                      router.replace('/login');
                    }}
                    className="flex items-center gap-2 text-left text-sm font-medium text-brand-danger transition-colors hover:opacity-80"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {copy.signOut}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
