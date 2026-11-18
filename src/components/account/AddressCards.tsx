'use client';

import { useEffect, useState } from 'react';
import { getCountries, type Country, type UserProfile } from '@/lib/api/checkout';
import { useDictionary } from '@/i18n/LocaleProvider';
import { AddressCard } from './AddressCard';

interface AddressCardsProps {
  profile: UserProfile | null;
}

/** Billing and shipping side by side; the country list is fetched once for both. */
export function AddressCards({ profile }: AddressCardsProps) {
  const copy = useDictionary().account;
  const [countries, setCountries] = useState<Country[]>([]);

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

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <h3 className="text-sm font-semibold text-brand-text">{copy.address.title}</h3>
        <p className="mt-0.5 text-xs text-brand-text-muted">{copy.address.note}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressCard type="billing" address={profile?.billing} countries={countries} />
        <AddressCard type="shipping" address={profile?.shipping} countries={countries} />
      </div>
    </div>
  );
}
