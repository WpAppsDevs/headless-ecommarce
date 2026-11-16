'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/errors';
import { getUser, type UserProfile } from '@/lib/api/checkout';
import { getOrders, type OrdersResult } from '@/lib/api/orders';
import { useAuthStore } from '@/stores/authStore';
import { AccountLayout } from '@/components/account/AccountLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDictionary } from '@/i18n/LocaleProvider';

export default function AccountPage() {
  const router = useRouter();
  const { logout, hydrated, isAuthenticated } = useAuthStore();
  const dictionary = useDictionary();
  const accountCopy = dictionary.account;

  const breadcrumbs = [
    { label: dictionary.common.home, href: '/' },
    { label: accountCopy.breadcrumb },
  ];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ordersResult, setOrdersResult] = useState<OrdersResult | null>(null);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until AuthHydrator has finished restoring the token
    if (!hydrated) return;

    // If definitely not authenticated after hydration, redirect immediately
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    async function init() {
      try {
        // Fetch profile + orders in parallel
        const [userProfile, orders] = await Promise.all([
          getUser(),
          getOrders(1, 100),
        ]);
        setProfile(userProfile);
        setOrdersResult(orders);
        setReady(true);
      } catch (e) {
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
        setInitError('Failed to load account. Please try again.');
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated]);

  return (
    <>
      <PageHeader
        title={accountCopy.breadcrumb}
        breadcrumbs={breadcrumbs}
        description={accountCopy.description}
      />

      {initError ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-red-600">{initError}</p>
        </div>
      ) : !ready ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <AccountLayout
          profile={profile}
          orders={ordersResult?.orders || []}
          ordersMeta={ordersResult?.meta || { page: 1, per_page: 100, total: 0, total_pages: 0 }}
        />
      )}
    </>
  );
}
