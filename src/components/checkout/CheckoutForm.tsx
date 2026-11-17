'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/errors';
import { useDictionary } from '@/i18n/LocaleProvider';
import { interpolate } from '@/i18n/interpolate';
import { getCountries, placeOrder } from '@/lib/api/checkout';
import { useCartStore } from '@/stores/cartStore';
import { useFormatPrice } from '@/lib/utils/currency';
import { BacsInfo } from './BacsInfo';
import type { StripeFormHandle } from './StripeForm';
import type { BillingAddress, AddressFields, UserProfile, Country } from '@/lib/api/checkout';
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

const buildSchema = (copy: {
  required: string;
  invalidEmail: string;
  shippingMethod: string;
  terms: string;
}) => z
  .object({
    billing: z.object({
      first_name: z.string().min(1, copy.required),
      email: z.string().email(copy.invalidEmail),
      phone: z.string().min(1, copy.required),
      address_1: z.string().min(1, copy.required),
      country: z.string().min(2, copy.required),
      state: z.string().min(1, copy.required),
      city: z.string().min(1, copy.required),
      postcode: z.string().min(1, copy.required),
    }),
    sameAsBilling: z.boolean(),
    shipping: z.object({
      first_name: z.string(),
      address_1: z.string(),
      country: z.string(),
      state: z.string(),
      city: z.string(),
      postcode: z.string(),
    }),
    gateway: z.enum(['stripe', 'bacs']),
    shipping_method: z.string().min(1, copy.shippingMethod),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: copy.terms,
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsBilling && data.shipping) {
      const s = data.shipping;
      const required = ['first_name', 'address_1', 'country', 'state', 'city', 'postcode'] as const;
      for (const key of required) {
        if (!s[key]) {
          ctx.addIssue({ code: 'custom', message: copy.required, path: ['shipping', key] });
        }
      }
    }
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

// ---------------------------------------------------------------------------
// Error code → user-friendly message
// ---------------------------------------------------------------------------

const API_ERROR_KEYS: Record<string, keyof ReturnType<typeof useDictionary>['checkout']['errors']> = {
  invalid_token: 'invalidToken',
  session_expired: 'invalidToken',
  empty_cart: 'emptyCart',
  unknown_gateway: 'unknownGateway',
  out_of_stock: 'outOfStock',
  order_creation_failed: 'orderFailed',
  payment_failed: 'paymentFailed',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  profile?: UserProfile;
  cartItems: CartItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutForm({ profile, cartItems }: Props) {
  const router = useRouter();
  const { clearCart, fetchCart, shippingMethods } = useCartStore();
  const stripeRef = useRef<StripeFormHandle>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const fmt = useFormatPrice();
  const dict = useDictionary();
  const copy = dict.checkout;
  const schema = useMemo(() => buildSchema(copy.errors), [copy.errors]);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  const defaultBilling: BillingAddress = profile?.billing ?? {
    first_name: '',
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    email: profile?.email ?? '',
    phone: '',
  };

  const defaultShipping: AddressFields = profile?.shipping ?? {
    first_name: '',
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      billing: defaultBilling,
      sameAsBilling: true,
      shipping: defaultShipping,
      gateway: 'bacs',
      shipping_method: '',
      terms_accepted: false,
    },
  });

  // Sync shipping_method default once shippingMethods loads from the store
  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0) {
      setValue('shipping_method', shippingMethods[0].id);
    }
  }, [shippingMethods, setValue]);

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch is used intentionally for live form state
  const sameAsBilling = watch('sameAsBilling');
  const gateway = watch('gateway');
  const selectedShippingMethod = watch('shipping_method');
  const billingFirstName = watch('billing.first_name');
  const billingAddr1 = watch('billing.address_1');
  const billingCountry = watch('billing.country');
  const billingState = watch('billing.state');
  const billingCity = watch('billing.city');
  const billingPostcode = watch('billing.postcode');
  const shippingCountry = watch('shipping.country');

  // Auto-fill shipping from billing when "same as billing" is checked
  useEffect(() => {
    if (sameAsBilling) {
      setValue('shipping.first_name', billingFirstName);
      setValue('shipping.address_1', billingAddr1);
      setValue('shipping.country', billingCountry);
      setValue('shipping.state', billingState);
      setValue('shipping.city', billingCity);
      setValue('shipping.postcode', billingPostcode);
    }
  }, [sameAsBilling, billingFirstName, billingAddr1, billingCountry, billingState, billingCity, billingPostcode, setValue]);


  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price);
    const qty = parseInt(item.quantity, 10);
    return sum + (isNaN(price) ? 0 : price) * (isNaN(qty) ? 1 : qty);
  }, 0);

  const selectedShipping = shippingMethods?.find((m) => m.id === selectedShippingMethod);
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.cost) : 0;
  const orderTotal = subtotal + shippingCost;

  const selectedBillingCountry = countries.find((c) => c.code === billingCountry);
  const selectedShippingCountryObj = countries.find((c) => c.code === shippingCountry);

  const onSubmit = async (values: FormValues) => {
    if (isPlacing) return;
    setIsPlacing(true);
    setApiError(null);

    try {
      await fetchCart();
      const currentCart = useCartStore.getState();
      if (currentCart.items.length === 0) {
        setApiError('Your cart is empty.');
        router.replace('/cart');
        return;
      }

      let paymentData: Record<string, string> | undefined;
      if (values.gateway === 'stripe') {
        if (!stripeRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 200));
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
          setTimeout(() => reject(new Error('Request timed out')), 30000),
        ),
      ]);

      clearCart();
      sessionStorage.setItem(`order_${result.order_id}`, JSON.stringify(result));
      router.push(`/order-confirmation/${result.order_id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(copy.errors[API_ERROR_KEYS[e.code]] ?? e.message);
      } else if (e instanceof Error && e.message === 'Request timed out') {
        setApiError('Request timed out. Please try again.');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  const onError = (formErrors: typeof errors) => {
    setApiError(null);

    // Build list of missing field labels
    const f = copy.fields;
    const FIELD_LABELS: Record<string, string> = {
      'billing.first_name': f.fullName,
      'billing.email': f.email,
      'billing.phone': f.phone,
      'billing.address_1': f.address,
      'billing.country': f.country,
      'billing.state': f.state,
      'billing.city': f.city,
      'billing.postcode': f.postcode,
      'shipping.first_name': f.shippingFullName,
      'shipping.address_1': f.shippingAddress,
      'shipping.country': f.shippingCountry,
      'shipping.state': f.shippingState,
      'shipping.city': f.shippingCity,
      'shipping.postcode': f.shippingPostcode,
      shipping_method: f.shippingMethod,
      terms_accepted: f.terms,
    };

    const missing: string[] = [];

    // Walk billing errors
    const b = formErrors.billing as Record<string, { message?: string }> | undefined;
    if (b) {
      for (const key of Object.keys(FIELD_LABELS).filter(k => k.startsWith('billing.'))) {
        const fieldKey = key.replace('billing.', '');
        if (b[fieldKey]) missing.push(FIELD_LABELS[key]);
      }
    }

    // Walk shipping errors
    const s = formErrors.shipping as Record<string, { message?: string }> | undefined;
    if (s) {
      for (const key of Object.keys(FIELD_LABELS).filter(k => k.startsWith('shipping.'))) {
        const fieldKey = key.replace('shipping.', '');
        if (s[fieldKey]) missing.push(FIELD_LABELS[key]);
      }
    }

    // Top-level fields
    if (formErrors.shipping_method) missing.push(FIELD_LABELS.shipping_method);
    if (formErrors.terms_accepted) missing.push(FIELD_LABELS.terms_accepted);

    if (missing.length === 0) {
      setFormError(copy.errors.requiredFields);
    } else {
      setFormError(interpolate(copy.errors.missing, { fields: missing.join(', ') }));
    }
  };

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      {apiError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {apiError}
        </div>
      )}
      {!apiError && formError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_480px]">
        {/* ── LEFT COLUMN: Billing / Shipping ──────────────────────────────── */}
        <div className="space-y-6">
          {/* Billing */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">{copy.billingAddress}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  {copy.fields.fullName} <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('billing.first_name')}
                  autoComplete="name"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                />
                {errors.billing?.first_name && (
                  <p className="text-xs text-rose-500">{errors.billing.first_name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  {copy.fields.phone} <span className="text-rose-500">*</span>
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
                  {copy.fields.email} <span className="text-rose-500">*</span>
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

              <div className="col-span-full space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  {copy.fields.country} <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('billing.country')}
                  autoComplete="billing country"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 bg-white"
                >
                  <option value="">{copy.selectCountry}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.billing?.country && (
                  <p className="text-xs text-rose-500">{errors.billing.country.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  {copy.fields.state} <span className="text-rose-500">*</span>
                </label>
                {selectedBillingCountry?.states.length ? (
                  <select
                    {...register('billing.state')}
                    autoComplete="billing address-level1"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 bg-white"
                  >
                    <option value="">{copy.selectState}</option>
                    {selectedBillingCountry.states.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...register('billing.state')}
                    autoComplete="billing address-level1"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                )}
                {errors.billing?.state && (
                  <p className="text-xs text-rose-500">{errors.billing.state.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  {copy.fields.city} <span className="text-rose-500">*</span>
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
                  {copy.fields.postcode} <span className="text-rose-500">*</span>
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
              <div className="col-span-full space-y-1">
                <label className="text-sm font-medium text-zinc-600">
                  {copy.fields.address} <span className="text-rose-500">*</span>
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
                {copy.shippingSame}
              </label>
            </div>

            {!sameAsBilling && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="col-span-full space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    {copy.fields.fullName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register('shipping.first_name')}
                    autoComplete="shipping name"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  {errors.shipping?.first_name && (
                    <p className="text-xs text-rose-500">{errors.shipping.first_name.message}</p>
                  )}
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    {copy.fields.country} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register('shipping.country')}
                    autoComplete="shipping country"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 bg-white"
                  >
                    <option value="">{copy.selectCountry}</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.shipping?.country && (
                    <p className="text-xs text-rose-500">{errors.shipping.country.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    {copy.fields.state} <span className="text-rose-500">*</span>
                  </label>
                  {selectedShippingCountryObj?.states.length ? (
                    <select
                      {...register('shipping.state')}
                      autoComplete="shipping address-level1"
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 bg-white"
                    >
                      <option value="">{copy.selectState}</option>
                      {selectedShippingCountryObj.states.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...register('shipping.state')}
                      autoComplete="shipping address-level1"
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
                    />
                  )}
                  {errors.shipping?.state && (
                    <p className="text-xs text-rose-500">{errors.shipping.state.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    {copy.fields.city} <span className="text-rose-500">*</span>
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
                    {copy.fields.postcode} <span className="text-rose-500">*</span>
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
                <div className="col-span-full space-y-1">
                  <label className="text-sm font-medium text-zinc-600">
                    {copy.fields.address} <span className="text-rose-500">*</span>
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
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN: Order Summary + Payment + Place Order ───────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">{copy.orderSummary}</h2>

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
                      <p className="text-xs text-zinc-500">
                        {interpolate(copy.qty, { qty: item.quantity })}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {fmt(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-zinc-100 pt-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-600">{copy.subtotal}</span>
                <span className="font-semibold text-zinc-900">{fmt(subtotal)}</span>
              </div>

              {/* Shipping Method Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">
                  Shipping <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {shippingMethods?.map((method) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-center justify-between"
                    >
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
                        {fmt(method.cost)}
                      </span>
                    </label>
                  )) ?? (
                    <p className="text-sm text-zinc-500">{copy.noShippingMethods}</p>
                  )}
                </div>
                {errors.shipping_method && (
                  <p className="text-xs text-rose-500">{errors.shipping_method.message}</p>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <span className="text-base font-bold text-zinc-900">{copy.total}</span>
                <span className="text-base font-bold text-zinc-900">{fmt(orderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">{copy.paymentMethod}</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  value="bacs"
                  className="h-4 w-4 accent-zinc-900"
                  {...register('gateway')}
                />
                <span className="text-sm font-medium text-zinc-900">{copy.bankTransfer}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  value="stripe"
                  className="h-4 w-4 accent-zinc-900"
                  {...register('gateway')}
                />
                <span className="text-sm font-medium text-zinc-900">{copy.creditCard}</span>
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
          </div>

          {/* Terms & Place Order */}
          <div className="mt-6">
            <div className="space-y-1">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                  {...register('terms_accepted')}
                />
                <span className="text-sm text-zinc-700">
                  {copy.agreeTo}{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-zinc-900 underline underline-offset-4"
                  >
                    {copy.termsLink}
                  </a>
                </span>
              </label>
              {errors.terms_accepted && (
                <p className="text-xs text-rose-500">{errors.terms_accepted.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPlacing}
              className="mt-4 w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlacing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {copy.placingOrder}
                </span>
              ) : (
                copy.placeOrder
              )}
            </button>

            <p className="mt-3 text-center text-xs text-zinc-500">
              {copy.secure}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
