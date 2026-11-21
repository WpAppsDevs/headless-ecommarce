'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, ShoppingBag, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { getOrders } from '@/lib/api/orders';
import type { OrderResult } from '@/lib/api/checkout';
import { useDictionary } from '@/i18n/LocaleProvider';
import { interpolate } from '@/i18n/interpolate';

export default function OrderConfirmationPage() {
  const copy = useDictionary().orderConfirmation;
  const { id } = useParams<{ id: string }>();
  const clearCart = useCartStore((s) => s.clearCart);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [order, setOrder] = useState<OrderResult | null>(null);
  const [lookedUp, setLookedUp] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Clear cart (safety: checkout clears first, this handles direct navigation)
    clearCart();

    void (async () => {
      // Fast path: the per-tab result written by CheckoutForm. Keeping it in
      // sessionStorage means a refresh still shows the payment reference.
      const raw =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(`order_${id}`)
          : null;

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as OrderResult;
          if (!cancelled) setOrder(parsed);
          if (!cancelled) setLookedUp(true);
          return;
        } catch {
          // Malformed data — fall through to the order lookup
        }
      }

      if (!hydrated) return;

      // Fallback for a direct visit or a cleared session: load recent orders
      // and find this one. WordPress remains the source of truth.
      if (isAuthenticated) {
        try {
          const { orders } = await getOrders(1, 100);
          const found = orders.find((entry) => entry.id === Number(id));
          if (!cancelled && found) {
            setOrder({
              order_id: found.id,
              status: found.status,
              transaction_id: null,
            });
          }
        } catch {
          // Order cannot be loaded in this tab — handled by the empty state
        }
      }

      if (!cancelled) setLookedUp(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, clearCart, hydrated, isAuthenticated]);

  const isCompleted = order?.status === 'completed';
  const isBacs = order?.status === 'pending' && !order.transaction_id;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center space-y-8">
      {/* Icon */}
      <div className="flex justify-center">
        {isCompleted ? (
          <CheckCircle className="h-16 w-16 text-green-500" />
        ) : (
          <Clock className="h-16 w-16 text-amber-500" />
        )}
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {interpolate(copy.titleConfirmed, { id })}
        </h1>
        <p className="text-muted-foreground">
          {copy.thankYou}
        </p>
      </div>

      {/* Status badge */}
      {order && (
        <div className="flex justify-center">
          <Badge
            variant={isCompleted ? 'default' : 'secondary'}
            className="text-sm px-3 py-1"
          >
            {isCompleted ? copy.paymentCompleted : copy.pendingPayment}
          </Badge>
        </div>
      )}

      {/* Transaction ID (Stripe) */}
      {order?.transaction_id && (
        <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-left space-y-1">
          <p className="text-muted-foreground">{copy.paymentReference}</p>
          <p className="font-mono text-xs break-all">{order.transaction_id}</p>
        </div>
      )}

      {/* BACS bank transfer instructions */}
      {isBacs && (
        <div className="rounded-md border bg-amber-50 border-amber-200 px-5 py-4 text-sm text-left space-y-2">
          <p className="font-semibold text-amber-900">
            {copy.bankTitle}
          </p>
          <p className="text-amber-800 leading-relaxed">
            {copy.bankBodyBefore}{' '}
            <strong>{interpolate(copy.orderRef, { id })}</strong>{' '}
            {copy.bankBodyAfter}
          </p>
          <p className="text-amber-700 text-xs">
            {copy.bankFooter}
          </p>
        </div>
      )}

      {/* Direct visit with no recoverable order */}
      {lookedUp && !order && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-600">
          {copy.loadFailed}{' '}
          <Link href="/account?tab=orders" className="font-medium underline underline-offset-2">
            {copy.viewOrders}
          </Link>{' '}
          {copy.contactSuffix}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/account"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <LayoutList className="mr-2 h-4 w-4" />
          {copy.viewMyOrders}
        </Link>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {copy.continueShopping}
        </Link>
      </div>
    </div>
  );
}
