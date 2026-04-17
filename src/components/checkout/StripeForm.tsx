'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export interface StripeFormHandle {
  /** Returns a Stripe PaymentMethod ID, or null on error (error displayed inline). */
  getPaymentMethodId: () => Promise<string | null>;
}

// Lazy-load Stripe — only initialised when the component mounts
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK ?? '');

// ---------------------------------------------------------------------------
// Inner form — must live inside <Elements>
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const StripeInner = forwardRef<StripeFormHandle, {}>((_, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getPaymentMethodId: async () => {
      setCardError(null);

      if (!stripe || !elements) {
        setCardError('Stripe has not loaded. Please refresh the page.');
        return null;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError('Card element not found. Please refresh the page.');
        return null;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setCardError(error.message ?? 'Card error. Please try again.');
        return null;
      }

      return paymentMethod?.id ?? null;
    },
  }));

  return (
    <div className="space-y-2">
      <div className="rounded-md border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                fontFamily: 'inherit',
                '::placeholder': { color: 'hsl(var(--muted-foreground))' },
              },
              invalid: { color: 'hsl(var(--destructive))' },
            },
          }}
        />
      </div>
      {cardError && (
        <p className="text-xs text-destructive">{cardError}</p>
      )}
    </div>
  );
});

StripeInner.displayName = 'StripeInner';

// ---------------------------------------------------------------------------
// Public export — wraps StripeInner in <Elements>
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const StripeForm = forwardRef<StripeFormHandle, {}>((_, ref) => (
  <Elements stripe={stripePromise}>
    <StripeInner ref={ref} />
  </Elements>
));

StripeForm.displayName = 'StripeForm';

