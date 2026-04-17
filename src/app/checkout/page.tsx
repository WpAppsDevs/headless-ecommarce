'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { getUser, type UserProfile } from '@/lib/api/checkout';
import { useCartStore } from '@/stores/cartStore';
import { ApiError } from '@/lib/errors';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, fetchCart } = useCartStore();

  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // 1. Verify auth + get profile for form pre-fill
      try {
        const userProfile = await getUser();
        setProfile(userProfile);
      } catch (e) {
        if (
          e instanceof ApiError &&
          (e.code === 'session_expired' || e.code === 'invalid_token')
        ) {
          router.replace('/login?redirect=/checkout');
          return;
        }
        // Profile fetch failed for another reason — show form unpre-filled
      }

      // 2. Ensure cart has items
      await fetchCart();
      if (useCartStore.getState().items.length === 0) {
        router.replace('/cart');
        return;
      }

      setReady(true);
    }

    init().catch(() => setInitError('Failed to load checkout. Please try again.'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="mb-6 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {items.reduce((s, i) => s + Number(i.quantity), 0)} item
        {items.reduce((s, i) => s + Number(i.quantity), 0) !== 1 ? 's' : ''} in your cart
      </div>

      <CheckoutForm profile={profile} />
    </div>
  );
}
