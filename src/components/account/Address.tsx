'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, MapPin, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { AddressUpdate, Country, UserProfile } from '@/lib/api/checkout';
import { getCountries, updateProfile } from '@/lib/api/checkout';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';

interface AddressProps {
  profile: UserProfile | null;
}

type AddressType = 'billing' | 'shipping';

type DisplayAddress = Partial<{
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}> | null | undefined;

type FormValues = Record<string, string>;

const EMPTY_FORM: FormValues = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: '',
  phone: '',
};

/** Form field → dictionary key. The form speaks the API's snake_case; the copy does not. */
const FIELD_LABELS = {
  first_name: 'firstName',
  last_name: 'lastName',
  company: 'company',
  address_1: 'address1',
  address_2: 'address2',
  city: 'city',
  state: 'state',
  postcode: 'postcode',
  country: 'country',
} as const;

const FIELD_ORDER = [
  'first_name',
  'last_name',
  'company',
  'address_1',
  'address_2',
  'city',
  'state',
  'postcode',
  'country',
] as const;

function toForm(address: DisplayAddress): FormValues {
  const values: FormValues = { ...EMPTY_FORM };
  for (const key of Object.keys(EMPTY_FORM)) {
    const value = (address as Record<string, unknown> | null | undefined)?.[key];
    values[key] = typeof value === 'string' ? value : '';
  }
  return values;
}

function isBlank(address: DisplayAddress): boolean {
  return (
    !address ||
    (!address.first_name &&
      !address.last_name &&
      !address.address_1 &&
      !address.city &&
      !address.country)
  );
}

/** The country name for a code, so a saved address reads "Bangladesh", not "BD". */
function countryLabel(countries: Country[], code: string): string {
  if (!code) return '';
  return countries.find((country) => country.code === code)?.name ?? code;
}

export function AddressCards({ profile }: AddressProps) {
  const copy = useDictionary().account;
  const setProfile = useAuthStore((s) => s.setProfile);

  const [countries, setCountries] = useState<Country[]>([]);
  const [editing, setEditing] = useState<AddressType | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCountries()
      .then((list) => {
        if (!cancelled) setCountries(list);
      })
      .catch(() => {
        // A country list is a convenience: without it the saved code still shows.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = (type: AddressType) => {
    setValues(toForm(type === 'billing' ? profile?.billing : profile?.shipping));
    setFormError(null);
    setEditing(type);
  };

  const setField = (field: string, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const save = async (type: AddressType) => {
    if (!values.first_name.trim() || !values.address_1.trim() || !values.city.trim()) {
      setFormError(copy.address.requiredError);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload: AddressUpdate = {};
      for (const field of FIELD_ORDER) payload[field] = values[field].trim();
      if (type === 'billing') payload.phone = values.phone.trim();

      const updated = await updateProfile({ [type]: payload });
      setProfile(updated);
      setEditing(null);
      toast.success(copy.address.saved);
    } catch {
      setFormError(copy.address.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const selectedCountry = countries.find((country) => country.code === values.country);

  const renderReadBlock = (type: AddressType) => {
    const address = type === 'billing' ? profile?.billing : profile?.shipping;
    const contact = type === 'billing' ? profile?.billing : undefined;
    return isBlank(address) ? (
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
            {address.country && (
              <span className="ml-1 text-brand-text-muted/70">({address.country})</span>
            )}
          </span>
        )}
        {type === 'billing' && contact?.phone && (
          <span className="block pt-1">{contact.phone}</span>
        )}
        {type === 'billing' && contact?.email && <span className="block">{contact.email}</span>}
      </address>
    );
  };

  const renderForm = (type: AddressType) => (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        void save(type);
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELD_ORDER.map((field) => {
          const isWide = ['address_1', 'address_2', 'company'].includes(field);
          return (
            <label
              key={field}
              className={`space-y-1 text-xs font-medium text-brand-text-muted ${
                isWide ? 'sm:col-span-2' : ''
              }`}
            >
              <span>{copy.address.fields[FIELD_LABELS[field]]}</span>
              {field === 'country' ? (
                <select
                  value={values.country}
                  onChange={(event) => {
                    setField('country', event.target.value);
                    setField('state', '');
                  }}
                  className="h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light"
                >
                  <option value="">{copy.address.fields.selectCountry}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              ) : field === 'state' && selectedCountry?.states.length ? (
                <select
                  value={values.state}
                  onChange={(event) => setField('state', event.target.value)}
                  className="h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light"
                >
                  <option value="">{copy.address.fields.selectState}</option>
                  {selectedCountry.states.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[field]}
                  onChange={(event) => setField(field, event.target.value)}
                  autoComplete={field === 'postcode' ? 'postal-code' : undefined}
                  className="h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light"
                />
              )}
            </label>
          );
        })}

        {type === 'billing' && (
          <label className="space-y-1 text-xs font-medium text-brand-text-muted">
            <span>{copy.address.fields.phone}</span>
            <input
              value={values.phone}
              onChange={(event) => setField('phone', event.target.value)}
              type="tel"
              autoComplete="tel"
              className="h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light"
            />
          </label>
        )}
      </div>

      {formError && (
        <p role="alert" className="text-xs font-medium text-brand-danger">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-accent-strong px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          )}
          {saving ? copy.address.saving : copy.address.save}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex min-h-10 items-center rounded-lg border border-brand-border px-4 text-sm font-medium text-brand-text transition-colors hover:bg-brand-bg"
        >
          {copy.address.cancel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['billing', 'shipping'] as AddressType[]).map((type) => (
        <section
          key={type}
          className="flex flex-col rounded-2xl border border-brand-border bg-white p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-text-muted" strokeWidth={1.6} aria-hidden="true" />
            <h3 className="flex-1 text-sm font-semibold text-brand-text">
              {type === 'billing' ? copy.address.billingTitle : copy.address.shippingTitle}
            </h3>
            {editing !== type && (
              <button
                type="button"
                onClick={() => startEditing(type)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
              >
                <Pencil className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                {copy.address.edit}
              </button>
            )}
          </div>

          {editing === type ? renderForm(type) : renderReadBlock(type)}
        </section>
      ))}
    </div>
  );
}
