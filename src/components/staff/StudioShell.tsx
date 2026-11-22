'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';
import { DashboardShell, type DashboardMenuItem } from '@/components/dashboard/DashboardShell';
import { personInitials, personName } from '@/lib/user-name';

/**
 * Chrome for the staff dashboard.
 *
 * It is the same shell as the account dashboard — identity card, rail, mobile
 * tab grid — with the staff menu and a way back to the shop. Deliberately no
 * storefront header, cart or footer, and logout returns to the login page.
 */
export function StudioShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const copy = useDictionary().staff;
  const { profile, user, logout } = useAuthStore();

  const name = personName(profile, user?.display_name ?? copy.memberFallback);
  const initials = personInitials(profile, '·');
  const email = profile?.email ?? user?.email ?? '';

  const menu: DashboardMenuItem[] = [
    { id: 'dashboard', label: copy.nav.dashboard, icon: Home },
    { id: 'products', label: copy.nav.products, icon: Package },
  ];

  const activeId = pathname.startsWith('/studio/products') ? 'products' : 'dashboard';

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  const trail = (
    <nav aria-label={copy.breadcrumbLabel} className="mt-3">
      <ol className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] leading-none text-white/70">
        <li>
          <Link href="/" className="transition-colors hover:text-white">
            {copy.viewShop}
          </Link>
        </li>
        <li aria-hidden="true" className="select-none text-white/40">
          ›
        </li>
        <li aria-current="page" className="font-medium text-white">
          {copy.identityLabel}
        </li>
      </ol>
    </nav>
  );

  return (
    <DashboardShell
      surface={copy.identityLabel}
      navLabel={copy.navLabel}
      identity={{
        initials,
        name,
        email,
        emptyEmail: copy.noEmail,
        trail,
      }}
      menu={menu}
      activeId={activeId}
      onSelect={(id) => {
        if (id === activeId) return;
        router.push(id === 'products' ? '/studio/products' : '/studio');
      }}
      logoutLabel={copy.signOut}
      onLogout={handleSignOut}
    >
      {children}
    </DashboardShell>
  );
}
