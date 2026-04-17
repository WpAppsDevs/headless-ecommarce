'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, ShoppingBag, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import type { OrderResult } from '@/lib/api/checkout';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  const [order, setOrder] = useState<OrderResult | null>(null);

  useEffect(() => {
    // Clear cart (safety: checkout page clears first, this handles direct navigation)
    clearCart();

    // Read order result saved by CheckoutForm before redirect
    const raw = sessionStorage.getItem(`order_${id}`);
    if (raw) {
      try {
        setOrder(JSON.parse(raw) as OrderResult);
        sessionStorage.removeItem(`order_${id}`);
      } catch {
        // Malformed data — ignore
      }
    }
  }, [id, clearCart]);

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
          Order #{id} confirmed!
        </h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. A confirmation email has been sent to you.
        </p>
      </div>

      {/* Status badge */}
      {order && (
        <div className="flex justify-center">
          <Badge
            variant={isCompleted ? 'default' : 'secondary'}
            className="text-sm px-3 py-1"
          >
            {isCompleted ? 'Payment Completed' : 'Pending Payment'}
          </Badge>
        </div>
      )}

      {/* Transaction ID (Stripe) */}
      {order?.transaction_id && (
        <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-left space-y-1">
          <p className="text-muted-foreground">Payment reference</p>
          <p className="font-mono text-xs break-all">{order.transaction_id}</p>
        </div>
      )}

      {/* BACS bank transfer instructions */}
      {isBacs && (
        <div className="rounded-md border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 px-5 py-4 text-sm text-left space-y-2">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Bank Transfer Instructions
          </p>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            Your order is reserved and awaiting payment. Please use{' '}
            <strong>Order #{id}</strong> as the payment reference when making your
            bank transfer. Full banking details have been sent to your email address.
          </p>
          <p className="text-amber-700 dark:text-amber-400 text-xs">
            Your order will be processed once the transfer is received.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/account"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <LayoutList className="mr-2 h-4 w-4" />
          View My Orders
        </Link>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
