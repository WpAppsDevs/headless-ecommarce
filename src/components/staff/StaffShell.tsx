'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';

/**
 * Chrome for the staff dashboard: a light top bar with the surface name, the
 * section links and the signed-in identity.
 *
 * It is not the storefront header on purpose — no cart, no wishlist, no search
 * — and it owns no `<main>`, because `(staff)/layout.tsx` already does.
 */
export function StaffShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const copy = useDictionary().staff;
  const { profile, user, logout } = useAuthStore();

  const identity = profile?.display_name || user?.display_name || profile?.email || '';

  const handleSignOut = async () => {
    await logout();
    router.replace('/studio/login');
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-xl font-semibold text-brand-accent-strong">
            {copy.brand}
          </span>
          <nav aria-label={copy.navLabel} className="flex items-center gap-1">
            <Link
              href="/studio/products"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-sm')}
            >
              {copy.nav.products}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-brand-text-muted sm:inline">{identity}</span>
          <Button type="button" variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            {copy.signOut}
          </Button>
        </div>
      </header>

      {children}
    </div>
  );
}
