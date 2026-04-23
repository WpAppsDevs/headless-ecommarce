'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem } from '@/lib/api/cart';

interface Props {
  item: CartItem;
}

function parseMeta(meta: string | null): { attributes: Record<string, string> } {
  try {
    const m = JSON.parse(meta ?? '') as { attributes?: Record<string, string> };
    return { attributes: m.attributes ?? {} };
  } catch {
    return { attributes: {} };
  }
}

export function CartItemRow({ item }: Props) {
  const { updateItem, removeItem, loading } = useCartStore();
  const qty = Number(item.quantity);
  const { attributes } = parseMeta(item.meta);
  const productName = item.product_name ? String(item.product_name) : `Product #${item.product_id}`;
  const imageUrl = item.product_image ? String(item.product_image) : null;

  const attrEntries = Object.entries(attributes).map(([k, v]) => ({
    label: k.replace(/^pa_/, '').replace(/_/g, ' '),
    value: String(v),
  }));

  return (
    <tr className="border-b border-zinc-100 last:border-0 align-middle">
      {/* Product column */}
      <td className="py-5 pl-5 pr-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={productName}
                width={64}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold uppercase text-zinc-300 select-none">
                {productName.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">
              {productName}
            </p>

            {/* Variant selects */}
            {attrEntries.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attrEntries.map(({ label, value }) => (
                  <select
                    key={label}
                    defaultValue={value}
                    aria-label={label}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs capitalize text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  >
                    <option value={value}>{value}</option>
                  </select>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Price — unit price */}
      <td className="py-5 pr-4 text-sm font-medium text-zinc-900 whitespace-nowrap">
        ${parseFloat(item.price || '0').toFixed(2)}
      </td>

      {/* Quantity stepper */}
      <td className="py-5 pr-4">
        <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-200">
          <button
            onClick={() => qty > 1 && updateItem(Number(item.id), qty - 1)}
            disabled={loading || qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="flex h-9 w-10 items-center justify-center border-x border-zinc-200 text-sm font-semibold tabular-nums text-zinc-900">
            {qty}
          </span>
          <button
            onClick={() => updateItem(Number(item.id), qty + 1)}
            disabled={loading}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-30"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </td>

      {/* Total — qty × unit price */}
      <td className="py-5 pr-4 text-sm font-semibold text-zinc-900 whitespace-nowrap">
        ${(parseFloat(item.price || '0') * qty).toFixed(2)}
      </td>

      {/* Remove */}
      <td className="py-5 pr-5">
        <button
          onClick={() => removeItem(Number(item.id))}
          disabled={loading}
          aria-label={`Remove ${productName}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-rose-200 text-rose-400 transition-colors hover:border-rose-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
