'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

type ShippingOption = 'free' | 'local' | 'flat';

const SHIPPING_OPTIONS: { id: ShippingOption; label: string; sublabel?: string; price: number }[] = [
  { id: 'free', label: 'Free Shipping', price: 0 },
  { id: 'local', label: 'Local:', sublabel: 'Local delivery', price: 35 },
  { id: 'flat', label: 'Flat Rate:', sublabel: 'Standard shipping', price: 35 },
];

export function CartSummary() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [shipping, setShipping] = useState<ShippingOption>('free');
  const [agreed, setAgreed] = useState(false);

  const shippingCost = SHIPPING_OPTIONS.find((o) => o.id === shipping)?.price ?? 0;

  return (
    <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-600">Subtotal</span>
        {/* Cart API does not return item prices — calculated at checkout */}
        <span className="font-semibold text-zinc-400 italic text-xs">Calculated at checkout</span>
      </div>

      {/* Discounts */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-600">Discounts</span>
        <span className="font-semibold text-zinc-400 italic text-xs">—</span>
      </div>

      <div className="border-t border-zinc-100" />

      {/* Shipping */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-600">Shipping</p>
        <div className="space-y-2.5">
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="shipping"
                  value={opt.id}
                  checked={shipping === opt.id}
                  onChange={() => setShipping(opt.id)}
                  className="h-4 w-4 accent-zinc-900"
                />
                <span className="text-sm text-zinc-700">{opt.label}</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">
                ${opt.price.toFixed(2)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-zinc-900">Total</span>
        <span className="text-base font-bold text-zinc-900">
          {shippingCost > 0 ? `+$${shippingCost.toFixed(2)} shipping` : 'Free shipping'}
        </span>
      </div>

      {/* Terms & Conditions */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
        />
        <span className="text-xs leading-snug text-zinc-500">
          I agree with the{' '}
          <Link
            href="/terms"
            className="text-zinc-800 underline underline-offset-2 hover:text-zinc-600"
          >
            Terms And Conditions
          </Link>
        </span>
      </label>

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
