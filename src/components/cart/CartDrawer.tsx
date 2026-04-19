'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, StickyNote, Truck, TicketPercent, Check } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from './CartItem';
import { FreeShippingBar } from './FreeShippingBar';

type ActionPanel = 'note' | 'shipping' | 'coupon' | null;

export function CartDrawer() {
  const { items, cartDrawerOpen, setCartDrawerOpen } = useCartStore();
  const [activePanel, setActivePanel] = useState<ActionPanel>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const totalQty = items.reduce((s, i) => s + Number(i.quantity), 0);

  const togglePanel = (panel: Exclude<ActionPanel, null>) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

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
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[11px] font-semibold text-white">
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
            {/* ── Free shipping bar ──────────────────────────────────────── */}
            <div className="shrink-0 border-b bg-zinc-50 px-5 py-3">
              {/* total=0 because cart API does not return item prices */}
              <FreeShippingBar total={0} threshold={100} />
            </div>

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

            {/* ── Action buttons (Note / Shipping / Coupon) ──────────────── */}
            <div className="shrink-0 border-t px-5 py-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'note', Icon: StickyNote, label: 'Note' },
                    { key: 'shipping', Icon: Truck, label: 'Shipping' },
                    { key: 'coupon', Icon: TicketPercent, label: 'Coupon' },
                  ] as const
                ).map(({ key, Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => togglePanel(key)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all ${
                      activePanel === key
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Expandable panels */}
              {activePanel === 'note' && (
                <textarea
                  placeholder="Add a note to your order…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition-colors"
                />
              )}
              {activePanel === 'coupon' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors"
                  />
                  <button className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
                    Apply
                  </button>
                </div>
              )}
              {activePanel === 'shipping' && (
                <p className="rounded-lg bg-zinc-50 px-3 py-2.5 text-xs leading-relaxed text-zinc-500">
                  Free shipping on orders over $100. Shipping costs are calculated at checkout
                  based on your delivery address.
                </p>
              )}
            </div>

            {/* ── Subtotal ───────────────────────────────────────────────── */}
            <div className="shrink-0 border-t px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900">Subtotal</span>
                <span className="text-xs italic text-zinc-400">Calculated at checkout</span>
              </div>
            </div>

            {/* ── Terms ─────────────────────────────────────────────────── */}
            <div className="shrink-0 px-5 pb-1">
              <label className="flex cursor-pointer items-center gap-2.5">
                <div
                  onClick={() => setTermsAgreed((v) => !v)}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    termsAgreed
                      ? 'border-zinc-900 bg-zinc-900'
                      : 'border-zinc-300 bg-white hover:border-zinc-500'
                  }`}
                  role="checkbox"
                  aria-checked={termsAgreed}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && setTermsAgreed((v) => !v)}
                >
                  {termsAgreed && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <span className="text-xs text-zinc-500">
                  I agree with{' '}
                  <Link
                    href="/terms"
                    className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                  >
                    Terms & Conditions
                  </Link>
                </span>
              </label>
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

