'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';

export function CartPageContent() {
  const { items, loading, error, fetchCart } = useCartStore();

  useEffect(() => {
    // CartHydrator already fetches on layout mount. Only retry when nothing
    // has been loaded yet and no request is in flight.
    const { items: currentItems, lastFetchedAt, loading: isLoading } =
      useCartStore.getState();
    if (currentItems.length === 0 && !lastFetchedAt && !isLoading) {
      void fetchCart();
    }
  }, [fetchCart]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          {/* Left: cart items table */}
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
          </div>

          {/* Right: order summary */}
          <CartSummary />
        </div>
      )}
    </div>
  );
}
