'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/** Restores auth state on page reload by calling authStore.hydrate() once. */
export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
