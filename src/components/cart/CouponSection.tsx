'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';

const DEMO_COUPONS = [
  { id: 1, discount: '10% OFF', label: 'For all orders from', minOrder: '$200', code: 'SAVE10NOW' },
  { id: 2, discount: '15% OFF', label: 'For all orders from', minOrder: '$300', code: 'EXTRA15' },
  { id: 3, discount: '20% OFF', label: 'For all orders from', minOrder: '$500', code: 'BIG20OFF' },
];

export function CouponSection() {
  const [code, setCode] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  function handleApply(couponCode?: string) {
    const applied = couponCode ?? code;
    if (!applied.trim()) return;
    // Coupon apply hook — integrate with checkout/cart API when available
    console.log('Applying coupon:', applied);
  }

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
        <Tag className="h-4 w-4 text-zinc-500" />
        Voucher / Discount Code
      </h3>

      {/* Input row */}
      <div className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Add voucher discount"
          aria-label="Coupon code"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
        />
        <button
          onClick={() => handleApply()}
          className="shrink-0 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 active:bg-zinc-800"
        >
          Apply Code
        </button>
      </div>

      {/* Coupon cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DEMO_COUPONS.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedId(c.id);
              setCode(c.code);
            }}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              selectedId === c.id
                ? 'border-zinc-900 bg-zinc-50'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              Discount
            </p>
            <p className="text-xs text-zinc-500">{c.label}</p>
            <p className="mt-1 text-sm font-bold text-zinc-900">
              {c.discount} {c.minOrder}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <code className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600">
                {c.code}
              </code>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(c.code);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleApply(c.code)}
                className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-zinc-700"
              >
                Apply
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
