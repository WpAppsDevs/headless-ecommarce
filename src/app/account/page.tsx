'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/errors';
import { getUser } from '@/lib/api/checkout';
import { getOrders, type OrdersResult } from '@/lib/api/orders';
import { useAuthStore } from '@/stores/authStore';
import { AccountLayout } from '@/components/account/AccountLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { useDictionary } from '@/i18n/LocaleProvider';

/**
 * The account page asks for one page of orders. The Orders tab pages five at a
 * time, and the dashboard needs six at most; asking for 100 pulled every line
 * item of every order through a proxy on a remote WordPress, which was most of
 * the load time.
 */
const ORDERS_PER_PAGE = 25;

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="hidden w-60 shrink-0 rounded-xl border border-brand-border bg-white p-3 lg:block">
          <div className="flex items-center gap-3 border-b border-brand-border pb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { logout, hydrated, isAuthenticated } = useAuthStore();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const dictionary = useDictionary();

  const [ordersResult, setOrdersResult] = useState<OrdersResult | null>(null);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    // Wait until AuthHydrator has finished restoring the token
    if (!hydrated) return;

    // If definitely not authenticated after hydration, redirect immediately
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        // Hydration already carries the profile; fetch it only when it does not.
        const [userProfile, orders] = await Promise.all([
          useAuthStore.getState().profile ?? getUser(),
          getOrders(1, ORDERS_PER_PAGE),
        ]);

        if (cancelled) return;
        setProfile(userProfile);
        setOrdersResult(orders);
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        if (
          e instanceof ApiError &&
          (e.code === 'session_expired' ||
            e.code === 'invalid_token' ||
            e.code === 'user_not_found' ||
            e.code === 'no_token')
        ) {
          await logout();
          router.replace('/login');
          return;
        }
        setInitError(true);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated]);

  if (initError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-brand-danger">{dictionary.account.loadFailed}</p>
      </div>
    );
  }

  if (!ready) return <AccountSkeleton />;

  return (
    <AccountLayout
      profile={profile}
      orders={ordersResult?.orders ?? []}
      ordersMeta={ordersResult?.meta ?? { page: 1, per_page: ORDERS_PER_PAGE, total: 0, total_pages: 0 }}
    />
  );
}
