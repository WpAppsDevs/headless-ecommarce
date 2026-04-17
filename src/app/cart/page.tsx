'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { items, loading, error, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {loading && items.length === 0 && (
        <p className="text-muted-foreground text-sm">Loading cart…</p>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground">Your cart is empty.</p>
          <Link href="/products" className={cn(buttonVariants())}>
            Continue Shopping
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Item list */}
          <div className="lg:col-span-2 divide-y rounded-lg border px-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <CartSummary />
        </div>
      )}
    </div>
  );
}
