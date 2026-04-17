'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

export function CartSummary() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalQty = items.reduce((sum, i) => sum + Number(i.quantity), 0);

  return (
    <div className="rounded-lg border bg-muted/40 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items</span>
          <span>{totalQty}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          {/* OQ-1: Cart API does not return item prices — calculated at checkout */}
          <span className="text-muted-foreground italic">Calculated at checkout</span>
        </div>
      </div>

      <button
        className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
        onClick={() => router.push('/checkout')}
        disabled={items.length === 0}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Go to Checkout
      </button>

      <Link
        href="/products"
        className="block text-center text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
