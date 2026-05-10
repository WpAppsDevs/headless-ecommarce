'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';

/**
 * Rehydrates wishlist state on page load.
 *
 * Waits for AuthHydrator to complete, then:
 *   - Authenticated users → fetch wishlist from server
 *   - Guests              → read product IDs from localStorage
 *
 * The `didHydrate` ref prevents double-invocation in React Strict Mode.
 */
export function WishlistHydrator() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (!hydrated || didHydrate.current) return;
    didHydrate.current = true;
    void hydrateWishlist(isAuthenticated);
  }, [hydrated, isAuthenticated, hydrateWishlist]);

  return null;
}
