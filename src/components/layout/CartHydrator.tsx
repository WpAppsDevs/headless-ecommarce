'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

/**
 * Rehydrates cart state on page load.
 *
 * Only fetches when there is something to restore:
 *   - Logged-in user  → fetch after auth hydration (tokenCache is populated)
 *   - Guest with saved cart → fetch immediately using localStorage guest token
 *   - Fresh guest (no token) → skip (avoids triggering the 401 → /login redirect)
 *
 * The didFetch ref prevents double-invocation in React Strict Mode.
 */
export function CartHydrator() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const didFetch = useRef(false);

  useEffect(() => {
    if (!hydrated || didFetch.current) return;

    const hasGuestToken =
      typeof window !== 'undefined' && !!localStorage.getItem('cart_token');

    // Nothing to restore for a brand-new visitor with no session
    if (!isAuthenticated && !hasGuestToken) return;

    didFetch.current = true;
    fetchCart();
  }, [hydrated, isAuthenticated, fetchCart]);

  return null;
}
