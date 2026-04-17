'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem as CartItemType } from '@/lib/api/cart';

interface Props {
  item: CartItemType;
  compact?: boolean;
}

export function CartItem({ item, compact = false }: Props) {
  const { updateItem, removeItem, loading } = useCartStore();

  const qty = Number(item.quantity);
  const productName = item.meta
    ? (() => { try { return (JSON.parse(item.meta) as { name?: string }).name ?? `Product #${item.product_id}`; } catch { return `Product #${item.product_id}`; } })()
    : `Product #${item.product_id}`;

  // Parse variation attributes from meta if present
  const variationAttrs: Record<string, string> = item.meta
    ? (() => { try { const m = JSON.parse(item.meta) as { attributes?: Record<string, string> }; return m.attributes ?? {}; } catch { return {}; } })()
    : {};

  const attrLabels = Object.entries(variationAttrs).map(([k, v]) => {
    const label = k.replace(/^pa_/, '').replace(/_/g, ' ');
    return `${label.charAt(0).toUpperCase() + label.slice(1)}: ${v}`;
  });

  return (
    <div className={`flex items-start gap-3 ${compact ? 'py-2' : 'py-4'}`}>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug truncate">{productName}</p>
        {attrLabels.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">{attrLabels.join(', ')}</p>
        )}
        {/* Subtotal omitted — OQ-1: cart API does not return item prices */}
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          aria-label="Decrease quantity"
          disabled={loading || qty <= 1}
          onClick={() => updateItem(Number(item.id), qty - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm tabular-nums">{qty}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          aria-label="Increase quantity"
          disabled={loading}
          onClick={() => updateItem(Number(item.id), qty + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
        aria-label="Remove item"
        disabled={loading}
        onClick={() => removeItem(Number(item.id))}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
