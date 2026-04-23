'use client';

import { useMemo, useState } from 'react';
import { Loader2, ShoppingCart, CheckCircle2, Heart, Minus, Plus, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import type { Product, ProductVariation } from '@/lib/api/products';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAttrLabel(key: string): string {
  const s = key.startsWith('pa_') ? key.slice(3) : key;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

function asVariationObjects(v: Product['variations']): ProductVariation[] {
  return (v as ProductVariation[]).filter((x): x is ProductVariation => typeof x === 'object');
}

const colorMap: Record<string, string> = {
  black: '#1a1a1a',
  white: '#ffffff',
  gray: '#9ca3af',
  grey: '#9ca3af',
  red: '#ef4444',
  blue: '#3b82f6',
  navy: '#1e3a5f',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  pink: '#ec4899',
  purple: '#a855f7',
  brown: '#92400e',
  beige: '#d4b896',
  khaki: '#c3b091',
  camel: '#c19a6b',
};

function isColorAttr(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.includes('color') || lower.includes('colour');
}

function getColorHex(name: string): string | null {
  return colorMap[name.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VariationSelector({ product }: { product: Product }) {
  const variations = useMemo(() => asVariationObjects(product.variations), [product.variations]);
  const isSimple = product.type === 'simple' || variations.length === 0;

  const addItem = useCartStore((s) => s.addItem);
  const loading = useCartStore((s) => s.loading);
  const cartError = useCartStore((s) => s.error);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const attrKeys = useMemo(() => {
    const keys = new Set<string>();
    variations.forEach((v) => Object.keys(v.attributes).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [variations]);

  const attrValues = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    attrKeys.forEach((k) => {
      map[k] = Array.from(new Set(variations.map((v) => v.attributes[k]).filter(Boolean)));
    });
    return map;
  }, [attrKeys, variations]);

  const selectedVariation = useMemo<ProductVariation | null>(() => {
    if (isSimple || Object.keys(selected).length < attrKeys.length) return null;
    return (
      variations.find((v) => attrKeys.every((k) => v.attributes[k] === selected[k])) ?? null
    );
  }, [variations, selected, attrKeys, isSimple]);

  const isOutOfStock = selectedVariation
    ? selectedVariation.stock_status === 'outofstock'
    : !isSimple
    ? false
    : product.stock_status === 'outofstock';

  const allSelected = isSimple || Object.keys(selected).length >= attrKeys.length;
  const canAdd = allSelected && !isOutOfStock && !loading;

  // Price display
  const displayPrice = selectedVariation
    ? selectedVariation.sale_price || selectedVariation.price
    : product.sale_price || product.price;
  const displayRegularPrice = selectedVariation
    ? selectedVariation.regular_price
    : product.regular_price;
  const isOnSale = selectedVariation ? selectedVariation.on_sale : product.on_sale;
  const savePercent =
    isOnSale && displayRegularPrice && displayPrice
      ? Math.round(
          ((parseFloat(displayRegularPrice) - parseFloat(displayPrice)) /
            parseFloat(displayRegularPrice)) *
            100,
        )
      : 0;

  async function handleAddToCart() {
    await addItem(product.id, selectedVariation?.id ?? 0, quantity, selected);
    if (!useCartStore.getState().error) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Price block */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-zinc-900">${displayPrice}</span>
        {isOnSale && displayRegularPrice && (
          <>
            <span className="text-lg text-zinc-400 line-through">${displayRegularPrice}</span>
            {savePercent > 0 && (
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                Save {savePercent}%
              </span>
            )}
          </>
        )}
      </div>

      {/* 2. Attribute pickers */}
      {!isSimple &&
        attrKeys.map((key) => (
          <div key={key}>
            <p className="mb-2.5 text-sm font-medium text-zinc-700">
              {formatAttrLabel(key)}
              {selected[key] && (
                <span className="ml-2 font-normal text-zinc-400">{selected[key]}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {attrValues[key].map((val) => {
                const isActive = selected[key] === val;
                if (isColorAttr(key)) {
                  const hex = getColorHex(val);
                  return (
                    <button
                      key={val}
                      title={val}
                      onClick={() => setSelected((prev) => ({ ...prev, [key]: val }))}
                      className={cn(
                        'relative h-9 w-9 rounded-full border-2 transition-all',
                        isActive
                          ? 'border-zinc-900 scale-110 shadow-md'
                          : 'border-zinc-200 hover:border-zinc-400',
                      )}
                      style={hex ? { backgroundColor: hex } : {}}
                    >
                      {!hex && (
                        <span className="text-[10px] font-semibold">
                          {val.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      {isActive && (
                        <span
                          className="absolute inset-0 flex items-center justify-center text-[13px] font-bold"
                          style={{ color: hex && hex !== '#ffffff' ? '#fff' : '#000' }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                }
                return (
                  <button
                    key={val}
                    onClick={() => setSelected((prev) => ({ ...prev, [key]: val }))}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-400',
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {/* 3. Quantity selector */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-zinc-700">Quantity</p>
        <div className="inline-flex items-center overflow-hidden rounded-xl border border-zinc-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="flex w-12 items-center justify-center text-sm font-semibold text-zinc-900">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Cart error */}
      {cartError && (
        <p role="alert" className="text-sm text-red-500">
          {cartError}
        </p>
      )}

      {/* 5. Add to Cart + Wishlist row */}
      <div className="flex gap-3">
        <Button
          className={cn(
            'flex-1 rounded-xl py-3.5 text-sm font-semibold transition-colors',
            added
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : isOutOfStock
              ? 'bg-zinc-200 text-zinc-400'
              : 'bg-zinc-900 text-white hover:bg-zinc-700',
          )}
          disabled={!canAdd}
          onClick={handleAddToCart}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : added ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Added to Cart!
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : !allSelected ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Select Options
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>

        <button
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => setWishlisted((w) => !w)}
          className={cn(
            'flex h-[52px] w-[52px] items-center justify-center rounded-xl border-2 transition-colors',
            wishlisted
              ? 'border-rose-500 bg-rose-50 text-rose-500'
              : 'border-zinc-200 text-zinc-400 hover:border-zinc-300',
          )}
        >
          <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* 6. Delivery strip */}
      <div className="space-y-3 rounded-xl bg-zinc-50 p-4">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-xs text-zinc-600">
            Free delivery on orders over $75. Estimated 3–6 business days.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-xs text-zinc-600">
            45-day returns. Duties &amp; taxes are non-refundable.
          </p>
        </div>
      </div>
    </div>
  );
}
