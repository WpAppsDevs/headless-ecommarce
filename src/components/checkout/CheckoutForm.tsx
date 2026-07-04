'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/errors';
import { placeOrder } from '@/lib/api/checkout';
import { apiGetShippingMethods } from '@/lib/api/cart';
import { useCartStore } from '@/stores/cartStore';
import { BacsInfo } from './BacsInfo';
import type { StripeFormHandle } from './StripeForm';
import type { BillingAddress, AddressFields, UserProfile, ShippingMethod } from '@/lib/api/checkout';
import type { CartItem } from '@/lib/api/cart';

// Code-split + no SSR — Stripe SDK must only run in the browser
const StripeForm = dynamic(
  () => import('./StripeForm').then((m) => m.StripeForm),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-500">
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
    shipping_method: z.string().min(1, 'Please select a shipping method'),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms',
    }),
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
// Props
// ---------------------------------------------------------------------------

interface Props {
  /** Pre-filled from GET /api/user on mount. May be undefined if fetch failed. */
  profile?: UserProfile;
  /** Cart items to display in order summary */
  cartItems: CartItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutForm({ profile, cartItems }: Props) {
  const router = useRouter();
  const { clearCart, fetchCart } = useCartStore();
  const stripeRef = useRef<StripeFormHandle>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  // Fetch shipping methods on mount
  useEffect(() => {
    apiGetShippingMethods().then((methods) => setShippingMethods(methods ?? [])).catch(() => {
      // Fallback to empty array if fetch fails
      setShippingMethods([]);
    });
  }, []);

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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      billing: defaultBilling,
      sameAsBilling: true,
      shipping: defaultShipping,
      gateway: 'bacs',
      shipping_method: shippingMethods[0]?.id ?? '',
      terms_accepted: false,
    },
  });

  const sameAsBilling = watch('sameAsBilling');
  const gateway = watch('gateway');
  const selectedShippingMethod = watch('shipping_method');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price);
    const qty = parseInt(item.quantity, 10);
    return sum + (isNaN(price) ? 0 : price) * (isNaN(qty) ? 1 : qty);
  }, 0);

  const selectedShipping = shippingMethods.find(m => m.id === selectedShippingMethod);
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.cost) : 0;
  const orderTotal = subtotal + shippingCost;

  const onSubmit = async (values: FormValues) => {
    // Double-submit guard
    if (isPlacing) return;
    setIsPlacing(true);
    setApiError(null);

    try {
      // Re-validate cart before placing order
      await fetchCart();
      const currentCart = useCartStore.getState();
      if (currentCart.items.length === 0) {
        setApiError('Your cart is empty.');
        router.replace('/cart');
        return;
      }

      // For Stripe: get payment method from StripeForm ref
      let paymentData: Record<string, string> | undefined;
      if (values.gateway === 'stripe') {
        // Wait for Stripe ref to be ready
        if (!stripeRef.current) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (stripeRef.current) {
          const pmId = await stripeRef.current.getPaymentMethodId();
          if (!pmId) {
            setApiError('Unable to process payment. Please check your card details.');
            return;
          }
          paymentData = { payment_method_id: pmId };
        } else {
          setApiError('Payment form not ready. Please refresh the page.');
          return;
        }
      }

      // Place order with timeout
      const result = await Promise.race([
        placeOrder({
          gateway: values.gateway,
          payment_data: paymentData,
          billing: values.billing as Record<string, string>,
          shipping: values.sameAsBilling
            ? undefined
            : (values.shipping as Record<string, string>),
          shipping_method: values.shipping_method,
          shipping_cost: selectedShipping?.cost,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 30000)
        ),
      ]);

      clearCart();
      sessionStorage.setItem(`order_${result.order_id}`, JSON.stringify(result));
      router.push(`/order-confirmation/${result.order_id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(API_ERRORS[e.code] ?? e.message);
      } else if (e instanceof Error && e.message === 'Request timed out') {
        setApiError('Request timed out. Please try again.');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── LEFT COLUMN: Billing / Shipping / Payment ─────────────────────── */}
        <div className="space-y-6">
          {/* Contact & Billing */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">Billing Address</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  First name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.first_name')}
                  autoComplete="billing given-name"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.first_name && (
                  <p className="text-xs text-rose-500">{errors.billing.first_name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Last name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.last_name')}
                  autoComplete="billing family-name"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.last_name && (
                  <p className="text-xs text-rose-500">{errors.billing.last_name.message}</p>
                )}
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Company <span className="text-zinc-400 text-xs">(optional)</span>
                </label>
                <input
                  {...register('billing.company')}
                  autoComplete="billing organization"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.email')}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.email && (
                  <p className="text-xs text-rose-500">{errors.billing.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.phone')}
                  type="tel"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.phone && (
                  <p className="text-xs text-rose-500">{errors.billing.phone.message}</p>
                )}
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Address line 1 <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.address_1')}
                  autoComplete="billing address-line1"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.address_1 && (
                  <p className="text-xs text-rose-500">{errors.billing.address_1.message}</p>
                )}
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Address line 2 <span className="text-zinc-400 text-xs">(optional)</span>
                </label>
                <input
                  {...register('billing.address_2')}
                  autoComplete="billing address-line2"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.city')}
                  autoComplete="billing address-level2"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.city && (
                  <p className="text-xs text-rose-500">{errors.billing.city.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  State / Province <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.state')}
                  autoComplete="billing address-level1"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.state && (
                  <p className="text-xs text-rose-500">{errors.billing.state.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Postcode / ZIP <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.postcode')}
                  autoComplete="billing postal-code"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.postcode && (
                  <p className="text-xs text-rose-500">{errors.billing.postcode.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  Country <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.country')}
                  autoComplete="billing country"
                  placeholder="US"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.country && (
                  <p className="text-xs text-rose-500">{errors.billing.country.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <input
                id="sameAsBilling"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                {...register('sameAsBilling')}
              />
              <label htmlFor="sameAsBilling" className="cursor-pointer text-sm font-medium text-zinc-700">
                Shipping address same as billing
              </label>
            </div>

            {!sameAsBilling && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    First name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.first_name')}
                    autoComplete="shipping given-name"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.first_name && (
                    <p className="text-xs text-rose-500">{errors.shipping.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    Last name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.last_name')}
                    autoComplete="shipping family-name"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.last_name && (
                    <p className="text-xs text-rose-500">{errors.shipping.last_name.message}</p>
                  )}
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    Company <span className="text-zinc-400 text-xs">(optional)</span>
                  </label>
                  <input
                    {...register('shipping.company')}
                    autoComplete="shipping organization"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    Address line 1 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.address_1')}
                    autoComplete="shipping address-line1"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.address_1 && (
                    <p className="text-xs text-rose-500">{errors.shipping.address_1.message}</p>
                  )}
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    Address line 2 <span className="text-zinc-400 text-xs">(optional)</span>
                  </label>
                  <input
                    {...register('shipping.address_2')}
                    autoComplete="shipping address-line2"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.city')}
                    autoComplete="shipping address-level2"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.city && (
                    <p className="text-xs text-rose-500">{errors.shipping.city.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.state')}
                    autoComplete="shipping address-level1"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.state && (
                    <p className="text-xs text-rose-500">{errors.shipping.state.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    Postcode / ZIP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.postcode')}
                    autoComplete="shipping postal-code"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.postcode && (
                    <p className="text-xs text-rose-500">{errors.shipping.postcode.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.country')}
                    autoComplete="shipping country"
                    placeholder="US"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.country && (
                    <p className="text-xs text-rose-500">{errors.shipping.country.message}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  value="bacs"
                  className="h-4 w-4 accent-zinc-900"
                  {...register('gateway')}
                />
                <span className="text-sm font-medium text-zinc-900">Bank Transfer (BACS)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  value="stripe"
                  className="h-4 w-4 accent-zinc-900"
                  {...register('gateway')}
                />
                <span className="text-sm font-medium text-zinc-900">Credit Card (Stripe)</span>
              </label>
            </div>

            {gateway === 'bacs' && (
              <div className="mt-4">
                <BacsInfo />
              </div>
            )}
            {gateway === 'stripe' && (
              <div className="mt-4">
                <StripeForm ref={stripeRef} />
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN: Order Summary ─────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Summary</h2>

            {/* Product List */}
            <div className="mb-6 space-y-4">
              {cartItems.map((item) => {
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantity, 10);
                const lineTotal = (isNaN(price) ? 0 : price) * (isNaN(qty) ? 1 : qty);

                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-400">
                          {item.product_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">{item.product_name}</p>
                      <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-zinc-100 pt-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-600">Subtotal</span>
                <span className="font-semibold text-zinc-900">${subtotal.toFixed(2)}</span>
              </div>

              {/* Shipping Method Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">
                  Shipping <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {shippingMethods.map((method) => (
                    <label key={method.id} className="flex cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          value={method.id}
                          className="h-4 w-4 accent-zinc-900"
                          {...register('shipping_method')}
                        />
                        <span className="text-sm text-zinc-700">{method.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">
                        ${parseFloat(method.cost).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.shipping_method && (
                  <p className="text-xs text-rose-500">{errors.shipping_method.message}</p>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <span className="text-base font-bold text-zinc-900">Total</span>
                <span className="text-base font-bold text-zinc-900">${orderTotal.toFixed(2)}</span>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-1 pt-2">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                    {...register('terms_accepted')}
                  />
                  <span className="text-sm text-zinc-700">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-900 underline underline-offset-4"
                    >
                      Terms & Conditions
                    </a>
                  </span>
                </label>
                {errors.terms_accepted && (
                  <p className="text-xs text-rose-500">{errors.terms_accepted.message}</p>
                )}
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isPlacing}
                className="mt-4 w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlacing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order…
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Secure checkout · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
