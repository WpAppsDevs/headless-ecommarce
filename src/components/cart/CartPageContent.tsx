'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { CouponSection } from '@/components/cart/CouponSection';
import { FreeShippingBar } from '@/components/cart/FreeShippingBar';

// These can be driven from a settings API in the future
const SETTINGS = {
  showExpiryBanner: true,
  showFreeShippingBar: true,
  showCouponSection: true,
  cartExpiryMinutes: 30,
  freeShippingThreshold: 100,
} as const;

function CartExpiryBanner({ minutes }: { minutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr =
    secondsLeft > 0
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : "Time's up!";
  const isUrgent = secondsLeft <= 60;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
      <span className="text-xl shrink-0">🔥</span>
      <p className="text-sm text-zinc-700">
        Your cart will expire in{' '}
        <span
          className={`font-bold tabular-nums ${isUrgent ? 'text-rose-600' : 'text-orange-500'}`}
        >
          {timeStr}
        </span>{' '}
        minutes! Please checkout now before your items sell out!
      </p>
    </div>
  );
}

export function CartPageContent() {
  const { items, loading, error, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Expiry banner — shown only when cart has items */}
      {SETTINGS.showExpiryBanner && items.length > 0 && (
        <div className="mb-4">
          <CartExpiryBanner minutes={SETTINGS.cartExpiryMinutes} />
        </div>
      )}

      {/* Free shipping progress */}
      {SETTINGS.showFreeShippingBar && items.length > 0 && (
        <div className="mb-6 rounded-xl border border-zinc-100 bg-white px-5 py-4">
          <FreeShippingBar total={0} threshold={SETTINGS.freeShippingThreshold} />
        </div>
      )}

      {/* API error */}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && items.length === 0 && (
        <div className="py-16 text-center text-sm text-zinc-400">Loading cart…</div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
            <ShoppingCart className="h-9 w-9 text-zinc-300" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-zinc-800">Your cart is empty</p>
            <p className="text-sm text-zinc-500">
              Looks like you haven&apos;t added anything yet.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-xl bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Main layout — items + summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: cart items table + coupon */}
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="py-4 pl-5 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Products
                    </th>
                    <th className="py-4 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Price
                    </th>
                    <th className="py-4 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Quantity
                    </th>
                    <th className="py-4 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Total Price
                    </th>
                    <th className="py-4 pr-5" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>

            {SETTINGS.showCouponSection && <CouponSection />}
          </div>

          {/* Right: order summary */}
          <CartSummary />
        </div>
      )}
    </div>
  );
}
