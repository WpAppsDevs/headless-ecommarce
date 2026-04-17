'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/errors';
import { placeOrder } from '@/lib/api/checkout';
import { useCartStore } from '@/stores/cartStore';
import { BacsInfo } from './BacsInfo';
import type { StripeFormHandle } from './StripeForm';
import type { BillingAddress, AddressFields, UserProfile } from '@/lib/api/checkout';

// Code-split + no SSR — Stripe SDK must only run in the browser
const StripeForm = dynamic(
  () => import('./StripeForm').then((m) => m.StripeForm),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-md border px-3 py-2.5 text-sm text-muted-foreground">
        Loading card form…
      </div>
    ),
  },
) as React.ForwardRefExoticComponent<React.RefAttributes<StripeFormHandle>>;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const addrBase = {
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  company: z.string(),
  address_1: z.string().min(1, 'Required'),
  address_2: z.string(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  postcode: z.string().min(1, 'Required'),
  country: z.string().min(2, 'Required'),
};

const schema = z
  .object({
    billing: z.object({
      ...addrBase,
      email: z.string().email('Invalid email'),
      phone: z.string().min(1, 'Required'),
    }),
    sameAsBilling: z.boolean(),
    shipping: z.object(addrBase).optional(),
    gateway: z.enum(['stripe', 'bacs']),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsBilling) {
      const s = data.shipping;
      const required: (keyof typeof addrBase)[] = [
        'first_name', 'last_name', 'address_1', 'city', 'state', 'postcode', 'country',
      ];
      for (const key of required) {
        if (!s?.[key]) {
          ctx.addIssue({ code: 'custom', message: 'Required', path: ['shipping', key] });
        }
      }
    }
  });

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Error code → user-friendly message
// ---------------------------------------------------------------------------

const API_ERRORS: Record<string, string> = {
  invalid_token: 'Session expired. Please log in again.',
  session_expired: 'Session expired. Please log in again.',
  empty_cart: 'Your cart is empty. Please add items before checking out.',
  unknown_gateway: 'Unknown payment method selected.',
  out_of_stock: 'One or more items are out of stock. Please review your cart.',
  order_creation_failed: 'Failed to create your order. Please try again.',
  payment_failed: 'Payment was declined. Please check your card details and try again.',
};

// ---------------------------------------------------------------------------
// Address field block (reusable within form)
// ---------------------------------------------------------------------------

function AddressBlock({
  prefix,
  register,
  errors,
  includeBillingOnly = false,
}: {
  prefix: 'billing' | 'shipping';
  register: ReturnType<typeof useForm<FormValues>>['register'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  includeBillingOnly?: boolean;
}) {
  const e = errors[prefix] as Record<string, { message?: string }> | undefined;
  const field = (name: string) => `${prefix}.${name}` as Parameters<typeof register>[0];
  const err = (name: string) => e?.[name]?.message;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>First name</Label>
        <Input {...register(field('first_name'))} autoComplete={`${prefix} given-name`} />
        {err('first_name') && <p className="text-xs text-destructive">{err('first_name')}</p>}
      </div>
      <div className="space-y-1">
        <Label>Last name</Label>
        <Input {...register(field('last_name'))} autoComplete={`${prefix} family-name`} />
        {err('last_name') && <p className="text-xs text-destructive">{err('last_name')}</p>}
      </div>
      <div className="col-span-full space-y-1">
        <Label>Company <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input {...register(field('company'))} autoComplete={`${prefix} organization`} />
      </div>
      <div className="col-span-full space-y-1">
        <Label>Address line 1</Label>
        <Input {...register(field('address_1'))} autoComplete={`${prefix} address-line1`} />
        {err('address_1') && <p className="text-xs text-destructive">{err('address_1')}</p>}
      </div>
      <div className="col-span-full space-y-1">
        <Label>Address line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input {...register(field('address_2'))} autoComplete={`${prefix} address-line2`} />
      </div>
      <div className="space-y-1">
        <Label>City</Label>
        <Input {...register(field('city'))} autoComplete={`${prefix} address-level2`} />
        {err('city') && <p className="text-xs text-destructive">{err('city')}</p>}
      </div>
      <div className="space-y-1">
        <Label>State / Province</Label>
        <Input {...register(field('state'))} autoComplete={`${prefix} address-level1`} />
        {err('state') && <p className="text-xs text-destructive">{err('state')}</p>}
      </div>
      <div className="space-y-1">
        <Label>Postcode / ZIP</Label>
        <Input {...register(field('postcode'))} autoComplete={`${prefix} postal-code`} />
        {err('postcode') && <p className="text-xs text-destructive">{err('postcode')}</p>}
      </div>
      <div className="space-y-1">
        <Label>Country</Label>
        <Input {...register(field('country'))} autoComplete={`${prefix} country`} placeholder="US" />
        {err('country') && <p className="text-xs text-destructive">{err('country')}</p>}
      </div>
      {includeBillingOnly && (
        <>
          <div className="col-span-full space-y-1">
            <Label>Email</Label>
            <Input {...register(field('email'))} type="email" autoComplete="email" />
            {err('email') && <p className="text-xs text-destructive">{err('email')}</p>}
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input {...register(field('phone'))} type="tel" autoComplete="tel" />
            {err('phone') && <p className="text-xs text-destructive">{err('phone')}</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  /** Pre-filled from GET /api/user on mount. May be undefined if fetch failed. */
  profile?: UserProfile;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutForm({ profile }: Props) {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const stripeRef = useRef<StripeFormHandle>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const defaultBilling: BillingAddress = profile?.billing ?? {
    first_name: '', last_name: '', company: '',
    address_1: '', address_2: '', city: '',
    state: '', postcode: '', country: '',
    email: profile?.email ?? '', phone: '',
  };

  const defaultShipping: AddressFields = profile?.shipping ?? {
    first_name: '', last_name: '', company: '',
    address_1: '', address_2: '', city: '',
    state: '', postcode: '', country: '',
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      billing: defaultBilling,
      sameAsBilling: true,
      shipping: defaultShipping,
      gateway: 'bacs',
    },
  });

  const sameAsBilling = watch('sameAsBilling');
  const gateway = watch('gateway');

  const onSubmit = async (values: FormValues) => {
    setApiError(null);

    // For Stripe: get payment method from StripeForm ref (Task 13 fills this in)
    let paymentData: Record<string, string> | undefined;
    if (values.gateway === 'stripe' && stripeRef.current) {
      const pmId = await stripeRef.current.getPaymentMethodId();
      if (!pmId) {
        setApiError('Unable to process payment. Please check your card details.');
        return;
      }
      paymentData = { payment_method_id: pmId };
    }

    try {
      const result = await placeOrder({
        gateway: values.gateway,
        payment_data: paymentData,
        billing: values.billing as Record<string, string>,
        shipping: values.sameAsBilling
          ? undefined
          : (values.shipping as Record<string, string>),
      });

      clearCart();
      router.push(`/order-confirmation/${result.order_id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(API_ERRORS[e.code] ?? e.message);
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {apiError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {/* ── Billing Address ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Billing Address</h2>
        <AddressBlock prefix="billing" register={register} errors={errors} includeBillingOnly />
      </section>

      {/* ── Shipping Address ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            id="sameAsBilling"
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            {...register('sameAsBilling')}
            defaultChecked
          />
          <Label htmlFor="sameAsBilling" className="cursor-pointer font-normal">
            Shipping address same as billing
          </Label>
        </div>

        {!sameAsBilling && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <AddressBlock prefix="shipping" register={register} errors={errors} />
          </div>
        )}
      </section>

      {/* ── Payment Method ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Payment Method</h2>
        <div className="space-y-2">
          {[
            { value: 'bacs', label: 'Bank Transfer (BACS)' },
            { value: 'stripe', label: 'Credit Card (Stripe)' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                value={value}
                className="h-4 w-4 accent-primary"
                {...register('gateway')}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        {gateway === 'stripe' && <StripeForm ref={stripeRef} />}
        {gateway === 'bacs' && <BacsInfo />}
      </section>

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing order…
          </>
        ) : (
          'Place Order'
        )}
      </Button>
    </form>
  );
}
