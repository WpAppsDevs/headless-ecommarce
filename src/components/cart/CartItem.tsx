'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem as CartItemType } from '@/lib/api/cart';
import { string } from 'zod';

interface Props {
  item: CartItemType;
}

function parseMeta(meta: string | null): { name: string; attributes: Record<string, string> } {
  try {
    const m = JSON.parse(meta ?? '') as {
      name?: string;
      attributes?: Record<string, string>;
    };
    return { name: m.name ?? '', attributes: m.attributes ?? {} };
  } catch {
    return { name: '', attributes: {} };
  }
}

export function CartItem({ item }: Props) {
  const { updateItem, removeItem, loading } = useCartStore();
  const qty = Number(item.quantity);
  const { attributes } = parseMeta(item.meta);
  const productName = String(item.product_name) || `Product #${item.product_id}`;
  const imageUrl = String(item.product_image) || productName.charAt(0);

  const attrEntries = Object.entries(attributes).map(([k, v]) => ({
    label: k.replace(/^pa_/, '').replace(/_/g, ' '),
    value: v,
  }));

  return (
    <div className="flex gap-3 px-5 py-4">
      {/* Image placeholder */}
      <div
        className="h-[72px] w-[72px] shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span className="text-2xl font-bold text-zinc-300 uppercase select-none">
          {imageUrl}
        </span>
      </div>

      {/* Info + controls */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Name + remove */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug line-clamp-2 text-zinc-900">
            {productName}
          </p>
          <button
            onClick={() => removeItem(Number(item.id))}
            disabled={loading}
            aria-label={`Remove ${productName}`}
            className="mt-0.5 shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Variant pills */}
        {attrEntries.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {attrEntries.map(({ label, value }) => (
              <span
                key={label}
                className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500 capitalize"
              >
                {label}: {value}
              </span>
            ))}
          </div>
        )}

        {/* Qty stepper */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-200 overflow-hidden">
            <button
              onClick={() => qty > 1 && updateItem(Number(item.id), qty - 1)}
              disabled={loading || qty <= 1}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center border-x border-zinc-200 text-xs font-semibold tabular-nums text-zinc-900">
              {qty}
            </span>
            <button
              onClick={() => updateItem(Number(item.id), qty + 1)}
              disabled={loading}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          {/* Price not available from cart API */}
          <span className="ml-auto text-xs text-zinc-400 italic">—</span>
        </div>
      </div>
    </div>
  );
}

