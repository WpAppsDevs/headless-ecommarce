'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, ShoppingCart, CheckCircle2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useFormatPrice } from '@/lib/utils/currency';
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
// Small local control
// ---------------------------------------------------------------------------

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex h-11 w-[112px] items-center justify-between overflow-hidden rounded-[8px] border border-[#D9D2CB] bg-white">
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className="flex h-full w-9 items-center justify-center text-[#1F2A3C] transition-colors hover:bg-[#F6E4E4] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9E2F45]"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="flex w-8 items-center justify-center text-sm font-semibold text-[#1F2A3C]">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Increase quantity"
        className="flex h-full w-9 items-center justify-center text-[#1F2A3C] transition-colors hover:bg-[#F6E4E4] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9E2F45]"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
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
  const fmt = useFormatPrice();

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const actionRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = actionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { rootMargin: '0px 0px -1px 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
  const canAdd = !isOutOfStock && !loading;

  // Price display
  const displayPrice = selectedVariation
    ? selectedVariation.sale_price || selectedVariation.price
    : product.sale_price || product.price;
  const displayRegularPrice = selectedVariation
    ? selectedVariation.regular_price
    : product.regular_price;
  const isOnSale = selectedVariation ? selectedVariation.on_sale : product.on_sale;

  function selectOption(key: string, value: string) {
    setSelected((prev) => ({ ...prev, [key]: value }));
    setSizeError(false);
  }

  function isOptionUnavailable(key: string, value: string): boolean {
    if (isSimple) return false;
    const candidates = variations.filter(
      (v) =>
        v.attributes[key] === value &&
        attrKeys.every((k) => k === key || !selected[k] || v.attributes[k] === selected[k]),
    );
    return candidates.length > 0 && candidates.every((v) => v.stock_status === 'outofstock');
  }

  const missingLabel = (() => {
    if (allSelected) return '';
    const missing = attrKeys.find((k) => !selected[k]);
    if (!missing) return 'Select an option';
    if (isColorAttr(missing)) return 'Select a color';
    if (missing.toLowerCase().includes('size')) return 'Select a size';
    return `Select ${formatAttrLabel(missing)}`;
  })();

  async function handleAddToCart() {
    if (!allSelected) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    await addItem(product.id, selectedVariation?.id ?? 0, quantity, selected);
    if (!useCartStore.getState().error) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  const colorKeys = attrKeys.filter(isColorAttr);
  const otherKeys = attrKeys.filter((k) => !isColorAttr(k));

  return (
    <>
      <div className="flex flex-col">
        {/* 1. Price */}
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[30px] font-bold leading-none text-[#1F2A3C] lg:text-[36px]">
            {fmt(displayPrice)}
          </span>
          {isOnSale && displayRegularPrice && (
            <span className="text-lg text-[#5A5A5A] line-through">{fmt(displayRegularPrice)}</span>
          )}
        </div>

        {/* 2 & 3. Color swatches + other attributes (size, etc.) */}
        {!isSimple && attrKeys.length > 0 && (
          <div className="mt-6 flex flex-col gap-5">
            {colorKeys.map((key) => (
              <div key={key}>
                <p className="mb-3 text-sm text-[#5A5A5A]">
                  <span className="font-medium text-[#1F2A3C]">Color</span>
                  {selected[key] && <span className="ml-1">: {selected[key]}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {attrValues[key].map((val) => {
                    const isActive = selected[key] === val;
                    const hex = getColorHex(val);
                    const variationImage =
                      variations.find((v) => v.attributes[key] === val)?.image || '';
                    return (
                      <button
                        key={val}
                        type="button"
                        title={val}
                        aria-label={`Color ${val}`}
                        aria-pressed={isActive}
                        onClick={() => selectOption(key, val)}
                        className={cn(
                          'relative h-11 w-11 overflow-hidden rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45]',
                          isActive
                            ? 'ring-2 ring-[#9E2F45] ring-offset-2 ring-offset-[#FBF7F3]'
                            : 'ring-1 ring-[#D9D2CB] hover:ring-[#9E2F45]/50',
                        )}
                      >
                        {hex ? (
                          <span
                            className="block h-full w-full rounded-full"
                            style={{ backgroundColor: hex }}
                          />
                        ) : variationImage ? (
                          <Image src={variationImage} alt={val} fill className="object-cover" sizes="44px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#5A5A5A]">
                            {val.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {otherKeys.map((key) => (
              <div key={key}>
                <p className="mb-3 text-sm text-[#5A5A5A]">
                  <span className="font-medium text-[#1F2A3C]">{formatAttrLabel(key)}</span>
                  {selected[key] && <span className="ml-1">: {selected[key]}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {attrValues[key].map((val) => {
                    const isActive = selected[key] === val;
                    const unavailable = isOptionUnavailable(key, val);
                    return (
                      <button
                        key={val}
                        type="button"
                        disabled={unavailable}
                        onClick={() => selectOption(key, val)}
                        aria-pressed={isActive}
                        className={cn(
                          'relative min-h-11 min-w-[48px] overflow-hidden rounded-[8px] border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45]',
                          isActive
                            ? 'border-[#9E2F45] bg-[#FBEAEA] text-[#9E2F45]'
                            : 'border-[#D9D2CB] bg-white text-[#1F2A3C] hover:border-[#9E2F45]',
                          unavailable && 'cursor-not-allowed opacity-50 hover:border-[#D9D2CB]',
                        )}
                      >
                        {val}
                        {unavailable && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top_right,transparent_45%,#D9D2CB_50%,transparent_55%)]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Quantity */}
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-[#1F2A3C]">Quantity</p>
          <QuantityStepper
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => q + 1)}
          />
        </div>

        {/* 5. Inline validation / cart errors (between quantity and action row) */}
        {cartError && (
          <p role="alert" className="mt-5 text-[13px] text-[#9E2F45]">
            {cartError}
          </p>
        )}
        {sizeError && !allSelected && (
          <p role="alert" className="mt-5 text-[13px] font-medium text-[#9E2F45]">
            {missingLabel}
          </p>
        )}

        {/* 6. Add to Cart + Wishlist */}
        <div ref={actionRef} className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[8px] px-4 font-serif text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45] disabled:cursor-not-allowed',
              added
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : isOutOfStock
                ? 'bg-[#D9D2CB] text-[#5A5A5A]'
                : 'bg-[#9E2F45] hover:bg-[#862640]',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : added ? (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Added to Cart!
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="mr-1 h-4 w-4" />
                Add to Cart
              </>
            )}
          </button>

          <WishlistButton
            productId={product.id}
            productName={product.name}
            variant="detail"
          />
        </div>
      </div>

      {/* Mobile sticky bottom bar (visible only after the main CTA scrolls away) */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 border-t border-[#E6DED6] bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(31,42,60,0.08)] transition-transform duration-300 lg:hidden',
          showSticky ? 'translate-y-0' : 'translate-y-full',
        )}
        inert={!showSticky}
      >
        {sizeError && !allSelected && (
          <p role="alert" className="mb-2 text-xs font-medium text-[#9E2F45]">
            {missingLabel}
          </p>
        )}
        <div className="flex items-center gap-3">
          <QuantityStepper
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => q + 1)}
          />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[8px] px-4 font-serif text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45] disabled:cursor-not-allowed',
              added
                ? 'bg-emerald-700'
                : isOutOfStock
                ? 'bg-[#D9D2CB] text-[#5A5A5A]'
                : 'bg-[#9E2F45] hover:bg-[#862640]',
            )}
          >
            {loading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : added ? (
              <CheckCircle2 className="mr-1 h-4 w-4" />
            ) : (
              <ShoppingCart className="mr-1 h-4 w-4" />
            )}
            <span>{isOutOfStock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
