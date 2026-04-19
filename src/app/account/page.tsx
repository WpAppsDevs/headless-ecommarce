'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/errors';
import { getUser, type UserProfile, type BillingAddress, type AddressFields } from '@/lib/api/checkout';
import { getOrders, type OrdersResult } from '@/lib/api/orders';
import { useAuthStore } from '@/stores/authStore';
import { OrdersList } from '@/components/account/OrdersList';

// ---------------------------------------------------------------------------
// Address block (read-only)
// ---------------------------------------------------------------------------

function AddressDisplay({ addr }: { addr: BillingAddress | AddressFields | null | undefined }) {
  if (!addr) return <p className="text-sm text-muted-foreground">Not set</p>;

  const a = addr as BillingAddress & AddressFields;
  const lines = [
    [a.first_name, a.last_name].filter(Boolean).join(' '),
    a.company,
    a.address_1,
    a.address_2,
    [a.city, a.state, a.postcode].filter(Boolean).join(', '),
    a.country,
    (a as BillingAddress).email,
    (a as BillingAddress).phone,
  ].filter(Boolean);

  if (lines.length === 0) return <p className="text-sm text-muted-foreground">Not set</p>;

  return (
    <address className="not-italic text-sm leading-relaxed text-muted-foreground">
      {lines.map((line, i) => (
        <span key={i} className="block">{line}</span>
      ))}
    </address>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccountPage() {
  const router = useRouter();
  const { logout, hydrated, isAuthenticated } = useAuthStore();

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
        // Fetch profile + first page of orders in parallel
        const [userProfile, orders] = await Promise.all([
          getUser(),
          getOrders(1, 10),
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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (initError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-destructive">{initError}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{profile?.display_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>

      {/* Addresses */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-5 space-y-2">
          <h2 className="font-semibold">Billing Address</h2>
          <AddressDisplay addr={profile?.billing} />
        </div>
        <div className="rounded-lg border p-5 space-y-2">
          <h2 className="font-semibold">Shipping Address</h2>
          <AddressDisplay addr={profile?.shipping} />
        </div>
      </section>

      {/* Orders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Order History</h2>
        {ordersResult && (
          <OrdersList
            initialOrders={ordersResult.orders}
            initialMeta={ordersResult.meta}
          />
        )}
      </section>
    </div>
  );
}
