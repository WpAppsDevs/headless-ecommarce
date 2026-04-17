'use client';

import Link from 'next/link';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from './CartItem';
import { Sheet } from '@/components/ui/sheet';

export function CartDrawer() {
  const { items, cartDrawerOpen, setCartDrawerOpen } = useCartStore();

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent side="right" className="flex w-full max-w-sm flex-col gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>
            Cart{items.length > 0 && ` (${items.reduce((s, i) => s + Number(i.quantity), 0)})`}
          </SheetTitle>
        </SheetHeader>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-5 divide-y">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </p>
          ) : (
            items.map((item) => (
              <CartItem key={item.id} item={item} compact />
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-2">
            <Link
              href="/checkout"
              onClick={() => setCartDrawerOpen(false)}
              className={cn(buttonVariants(), 'w-full text-center')}
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={() => setCartDrawerOpen(false)}
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full text-center')}
            >
              View Cart
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
