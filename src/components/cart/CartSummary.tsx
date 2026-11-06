'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { DEFAULT_SHIPPING_METHODS } from '@/lib/api/cart';
import { useFormatPrice } from '@/lib/utils/currency';

export function CartSummary() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const shippingMethods =
    useCartStore((s) => s.shippingMethods) ?? DEFAULT_SHIPPING_METHODS;
  const chosenShippingMethod = useCartStore((s) => s.chosenShippingMethod);

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price || '0') * Number(item.quantity),
    0,
  );
  const fmt = useFormatPrice();

  const chosen = shippingMethods.find((method) => method.id === chosenShippingMethod);
  const shippingCost = chosen ? parseFloat(chosen.cost || '0') : 0;

  return (
    <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-600">Subtotal</span>
        <span className="font-semibold text-zinc-900">{fmt(subtotal)}</span>
      </div>

      {/* Discounts */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-600">Discounts</span>
        <span className="font-semibold text-zinc-400 italic text-xs">—</span>
      </div>

      <div className="border-t border-zinc-100" />

      {/* Shipping options are shown for reference; checkout owns the selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-600">Shipping</p>
        <div className="space-y-2">
          {shippingMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-700">{method.label}</span>
              <span className="font-semibold text-zinc-900">{fmt(method.cost)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-snug text-zinc-400">
          Shipping is selected at checkout based on your delivery address.
        </p>
      </div>

      <div className="border-t border-zinc-100" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-zinc-900">
          {chosen ? 'Total' : 'Estimated total'}
        </span>
        <span className="text-base font-bold text-zinc-900">
          {fmt(subtotal + shippingCost)}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/checkout')}
        disabled={items.length === 0}
        className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Process To Checkout
      </button>

      <p className="text-center text-sm text-zinc-400">
        Or{' '}
        <Link
          href="/products"
          className="text-zinc-800 underline underline-offset-2 hover:text-zinc-600"
        >
          continue shopping
        </Link>
      </p>
    </div>
  );
}
