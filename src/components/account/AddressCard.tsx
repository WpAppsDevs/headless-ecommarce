'use client';

import { useState } from 'react';
import { Check, Loader2, MapPin, Pencil, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  updateProfile,
  type AddressFields,
  type AddressUpdate,
  type BillingAddress,
  type Country,
} from '@/lib/api/checkout';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';

const INPUT_CLASS =
  'h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light';

type AddressType = 'billing' | 'shipping';

interface AddressCardProps {
  type: AddressType;
  address: BillingAddress | AddressFields | undefined;
  countries: Country[];
}

/** The country name for a code, so a saved address reads "Bangladesh", not "BD". */
function countryLabel(countries: Country[], code: string): string {
  if (!code) return '';
  return countries.find((country) => country.code === code)?.name ?? code;
}

function isBlank(address: BillingAddress | AddressFields | undefined): boolean {
  return (
    !address ||
    (!address.first_name && !address.last_name && !address.address_1 && !address.city && !address.country)
  );
}

/** One address: read view, then an inline form when the customer edits it. */
export function AddressCard({ type, address, countries }: AddressCardProps) {
  const copy = useDictionary().account;
  const setProfile = useAuthStore((s) => s.setProfile);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({
    firstName: z.string().trim().min(1, copy.address.requiredError),
    lastName: z.string().trim(),
    company: z.string().trim(),
    address1: z.string().trim().min(1, copy.address.requiredError),
    address2: z.string().trim(),
    city: z.string().trim().min(1, copy.address.requiredError),
    state: z.string().trim(),
    postcode: z.string().trim(),
    country: z.string().trim(),
    phone: z.string().trim(),
  });

  type FormValues = z.infer<typeof schema>;

  const defaults: FormValues = {
    firstName: address?.first_name ?? '',
    lastName: address?.last_name ?? '',
    company: address?.company ?? '',
    address1: address?.address_1 ?? '',
    address2: address?.address_2 ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postcode: address?.postcode ?? '',
    country: address?.country ?? '',
    phone: type === 'billing' ? ((address as BillingAddress | undefined)?.phone ?? '') : '',
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const countryCode = useWatch({ control, name: 'country' });
  const selectedCountry = countries.find((country) => country.code === countryCode);

  const startEditing = () => {
    reset(defaults);
    setFormError(null);
    setEditing(true);
  };

  const onSubmit = async (values: FormValues) => {
    const payload: AddressUpdate = {
      first_name: values.firstName,
      last_name: values.lastName,
      company: values.company,
      address_1: values.address1,
      address_2: values.address2,
      city: values.city,
      state: values.state,
      postcode: values.postcode,
      country: values.country,
    };
    if (type === 'billing') payload.phone = values.phone;

    setFormError(null);
    try {
      const updated = await updateProfile({ [type]: payload });
      setProfile(updated);
      setEditing(false);
      toast.success(copy.address.saved);
    } catch {
      setFormError(copy.address.saveFailed);
    }
  };

  const heading = type === 'billing' ? copy.address.billingTitle : copy.address.shippingTitle;
  const requiredMessage = errors.firstName?.message ?? errors.address1?.message ?? errors.city?.message;

  return (
    <section className="flex flex-col rounded-2xl border border-brand-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-brand-text-muted" strokeWidth={1.6} aria-hidden="true" />
        <h3 className="flex-1 text-sm font-semibold text-brand-text">{heading}</h3>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
          >
            <Pencil className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            {copy.address.edit}
          </button>
        )}
      </div>

      {editing ? (
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.address.fields.firstName}</span>
              <input {...register('firstName')} autoComplete="given-name" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.address.fields.lastName}</span>
              <input {...register('lastName')} autoComplete="family-name" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted sm:col-span-2">
              <span>{copy.address.fields.company}</span>
              <input {...register('company')} autoComplete="organization" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted sm:col-span-2">
              <span>{copy.address.fields.address1}</span>
              <input {...register('address1')} autoComplete="address-line1" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted sm:col-span-2">
              <span>{copy.address.fields.address2}</span>
              <input {...register('address2')} autoComplete="address-line2" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.address.fields.city}</span>
              <input {...register('city')} autoComplete="address-level2" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.address.fields.postcode}</span>
              <input {...register('postcode')} autoComplete="postal-code" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.address.fields.country}</span>
              <select
                {...register('country', {
                  onChange: () => setValue('state', ''),
                })}
                className={INPUT_CLASS}
              >
                <option value="">{copy.address.fields.selectCountry}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.address.fields.state}</span>
              {selectedCountry?.states.length ? (
                <select {...register('state')} className={INPUT_CLASS}>
                  <option value="">{copy.address.fields.selectState}</option>
                  {selectedCountry.states.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...register('state')} autoComplete="address-level1" className={INPUT_CLASS} />
              )}
            </label>
            {type === 'billing' && (
              <label className="space-y-1 text-xs font-medium text-brand-text-muted sm:col-span-2">
                <span>{copy.address.fields.phone}</span>
                <input {...register('phone')} type="tel" autoComplete="tel" className={INPUT_CLASS} />
              </label>
            )}
          </div>

          {(requiredMessage || formError) && (
            <p role="alert" className="text-xs font-medium text-brand-danger">
              {requiredMessage ?? formError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-accent-strong px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
              )}
              {isSubmitting ? copy.address.saving : copy.address.save}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand-border px-4 text-sm font-medium text-brand-text transition-colors hover:bg-brand-bg"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {copy.address.cancel}
            </button>
          </div>
        </form>
      ) : isBlank(address) ? (
        <p className="py-6 text-center text-sm text-brand-text-muted">{copy.address.empty}</p>
      ) : (
        <address className="space-y-0.5 text-sm not-italic leading-relaxed text-brand-text-muted">
          {(address?.first_name || address?.last_name) && (
            <span className="block font-semibold text-brand-text">
              {address?.first_name} {address?.last_name}
            </span>
          )}
          {address?.company && <span className="block">{address.company}</span>}
          {address?.address_1 && <span className="block">{address.address_1}</span>}
          {address?.address_2 && <span className="block">{address.address_2}</span>}
          <span className="block">
            {[address?.city, address?.state, address?.postcode].filter(Boolean).join(', ')}
          </span>
          {address?.country && (
            <span className="block">
              {countryLabel(countries, address.country)}
              <span className="ml-1 text-brand-text-muted/70">({address.country})</span>
            </span>
          )}
          {type === 'billing' && (address as BillingAddress).phone && (
            <span className="block pt-1">{(address as BillingAddress).phone}</span>
          )}
          {type === 'billing' && (address as BillingAddress).email && (
            <span className="block">{(address as BillingAddress).email}</span>
          )}
        </address>
      )}
    </section>
  );
}
