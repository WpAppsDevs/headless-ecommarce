'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useDictionary } from '@/i18n/LocaleProvider';

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
  const copy = useDictionary().checkout;
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getPaymentMethodId: async () => {
      setCardError(null);

      if (!stripe || !elements) {
        setCardError(copy.errors.stripeNotLoaded);
        return null;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError(copy.errors.cardElementMissing);
        return null;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setCardError(error.message ?? copy.errors.cardError);
        return null;
      }

      return paymentMethod?.id ?? null;
    },
  }));

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 focus-within:ring-1 focus-within:ring-zinc-300">
        <CardElement
          options={{
            // Stripe Elements renders in its own iframe and cannot read CSS variables.
            // Keep these literals in step with --brand-text, --brand-text-muted and the danger colour.
            style: {
              base: {
                fontSize: '14px',
                color: '#0F1115',
                fontFamily: 'inherit',
                '::placeholder': { color: '#8A8F99' },
              },
              invalid: { color: '#C0392B' },
            },
          }}
        />
      </div>
      {cardError && (
        <p className="text-xs text-rose-500 mt-1">{cardError}</p>
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

