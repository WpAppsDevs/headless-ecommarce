'use client';

import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from './CartItem';
import { useFormatPrice } from '@/lib/utils/currency';

export function CartDrawer() {
  const { items, cartDrawerOpen, setCartDrawerOpen } = useCartStore();

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price || '0') * Number(item.quantity),
    0,
  );
  const totalQty = items.reduce((s, i) => s + Number(i.quantity), 0);
  const fmt = useFormatPrice();

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              Shopping Cart
            </h2>
            {totalQty > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-accent-strong px-1.5 text-[11px] font-semibold text-white">
                {totalQty}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <ShoppingBag className="h-7 w-7 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">Your cart is empty</p>
              <p className="text-xs text-zinc-400">Add items to get started</p>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ── Items list ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={item.id}>
                  <CartItem item={item} />
                  {idx < items.length - 1 && (
                    <div className="mx-5 border-b border-dashed border-zinc-100" />
                  )}
                </div>
              ))}
            </div>

            {/* ── Shipping note ──────────────────────────────────────────── */}
            <div className="shrink-0 border-t px-5 py-3">
              <p className="text-xs leading-relaxed text-zinc-500">
                Shipping is calculated at checkout based on your delivery address.{' '}
                <Link
                  href="/shipping"
                  className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                >
                  Delivery details
                </Link>
              </p>
            </div>

            {/* ── Subtotal ───────────────────────────────────────────────── */}
            <div className="shrink-0 border-t px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900">Subtotal</span>
                <span className="text-sm font-bold text-zinc-900">{fmt(subtotal)}</span>
              </div>
            </div>

            {/* ── CTA buttons ────────────────────────────────────────────── */}
            <div className="shrink-0 border-t px-5 py-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setCartDrawerOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setCartDrawerOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  Check Out
                </Link>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="w-full py-1 text-center text-xs text-zinc-400 transition-colors hover:text-zinc-700"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

