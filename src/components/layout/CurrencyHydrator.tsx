'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/stores/currencyStore';

/** Fetches store settings on first client load and populates the currency store. */
export function CurrencyHydrator() {
  const hydrate = useCurrencyStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
