'use client';

import { useMemo, useState } from 'react';
import { Loader2, ShoppingCart, CheckCircle2 } from 'lucide-react';
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

/** Safely cast variations — detail endpoint always returns objects, list returns IDs. */
function asVariationObjects(v: Product['variations']): ProductVariation[] {
  return (v as ProductVariation[]).filter((x): x is ProductVariation => typeof x === 'object');
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

  // All unique attribute keys across every variation
  const attrKeys = useMemo(() => {
    const keys = new Set<string>();
    variations.forEach((v) => Object.keys(v.attributes).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [variations]);

  // Unique values per attribute key
  const attrValues = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    attrKeys.forEach((k) => {
      map[k] = Array.from(new Set(variations.map((v) => v.attributes[k]).filter(Boolean)));
    });
    return map;
  }, [attrKeys, variations]);

  // Find the variation matching all current selections
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

  async function handleAddToCart() {
    await addItem(product.id, selectedVariation?.id ?? 0, 1);
    // useCartStore.getState() reads the latest state after the async action settles
    if (!useCartStore.getState().error) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Attribute pickers */}
      {!isSimple &&
        attrKeys.map((key) => (
          <div key={key}>
            <p className="mb-2 text-sm font-medium">
              {formatAttrLabel(key)}
              {selected[key] && (
                <span className="ml-2 font-normal text-muted-foreground">{selected[key]}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {attrValues[key].map((val) => (
                <button
                  key={val}
                  onClick={() => setSelected((prev) => ({ ...prev, [key]: val }))}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                    selected[key] === val
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary',
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}

      {/* Variation-specific price (overrides base price shown in page) */}
      {selectedVariation && (
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold">
            ${selectedVariation.sale_price || selectedVariation.price}
          </span>
          {selectedVariation.on_sale && (
            <span className="text-lg text-muted-foreground line-through">
              ${selectedVariation.regular_price}
            </span>
          )}
        </div>
      )}

      {/* Cart error */}
      {cartError && (
        <p role="alert" className="text-sm text-destructive">
          {cartError}
        </p>
      )}

      {/* Add to Cart */}
      <Button size="lg" className="w-full sm:w-auto" disabled={!canAdd} onClick={handleAddToCart}>
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
          'Select Options'
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
