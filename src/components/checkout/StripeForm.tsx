'use client';

import { forwardRef, useImperativeHandle } from 'react';

export interface StripeFormHandle {
  /** Returns a Stripe PaymentMethod ID, or null if not ready. */
  getPaymentMethodId: () => Promise<string | null>;
}

/**
 * Stub component — full Stripe CardElement implementation added in Task 13.
 * Exposes `getPaymentMethodId()` via ref so CheckoutForm can call it on submit.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const StripeForm = forwardRef<StripeFormHandle, {}>(
  function StripeForm(_, ref) {
    useImperativeHandle(ref, () => ({
      getPaymentMethodId: async () => null,
    }));

    return (
      <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
        Credit card form will appear here (Stripe — Task 13)
      </div>
    );
  },
);
