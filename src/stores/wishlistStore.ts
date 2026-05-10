import { create } from 'zustand';
import { toast } from 'sonner';
import {
  apiToggleWishlist,
  apiRemoveFromWishlist,
  apiGetWishlist,
} from '@/lib/api/wishlist';
import { tokenCache } from '@/lib/api/client';
import { ApiError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Guest localStorage helpers
// ---------------------------------------------------------------------------

const GUEST_KEY = 'wishlist_ids';

function loadGuestIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveGuestIds(ids: number[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
}

function clearGuestIds(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_KEY);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishlistState {
  /** Product IDs currently in the wishlist. */
  ids: number[];
  /** Server-reported total count (may exceed `ids.length` for paginated fetches). */
  count: number;
  /** IDs of products whose toggle/remove request is currently in-flight. */
  pendingIds: Set<number>;
  hydrated: boolean;
}

interface WishlistActions {
  /** Toggle wishlist state for a product with optimistic update. */
  toggle: (productId: number, productName?: string) => Promise<void>;
  /** Remove a product from the wishlist with optimistic update. */
  remove: (productId: number) => Promise<void>;
  /** Returns true if the product is currently in the wishlist. */
  isWishlisted: (productId: number) => boolean;
  /** Returns true if a toggle/remove request is in-flight for this product. */
  isPending: (productId: number) => boolean;
  /**
   * Hydrate wishlist state on page load.
   * Auth users: fetch from server. Guests: read from localStorage.
   */
  hydrate: (isAuthenticated: boolean) => Promise<void>;
  /**
   * Merge localStorage guest wishlist into the server after login.
   * Call this immediately after a successful login or registration.
   */
  syncGuestWishlist: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWishlistStore = create<WishlistState & WishlistActions>((set, get) => ({
  ids: [],
  count: 0,
  pendingIds: new Set(),
  hydrated: false,

  isWishlisted: (productId) => get().ids.includes(productId),

  isPending: (productId) => get().pendingIds.has(productId),

  // ── toggle ─────────────────────────────────────────────────────────────────
  toggle: async (productId, productName) => {
    if (get().pendingIds.has(productId)) return;

    const prevIds = get().ids;
    const wasWishlisted = prevIds.includes(productId);
    const nextIds = wasWishlisted
      ? prevIds.filter((id) => id !== productId)
      : [...prevIds, productId];

    // Optimistic update
    set((s) => ({
      ids: nextIds,
      count: nextIds.length,
      pendingIds: new Set([...s.pendingIds, productId]),
    }));

    const isAuthenticated = !!tokenCache.get();

    if (!isAuthenticated) {
      // Guest: persist to localStorage only
      saveGuestIds(nextIds);
      set((s) => {
        const next = new Set(s.pendingIds);
        next.delete(productId);
        return { pendingIds: next };
      });
      toast.success(
        wasWishlisted
          ? 'Removed from wishlist'
          : productName
          ? `"${productName}" saved to wishlist`
          : 'Added to wishlist',
      );
      return;
    }

    // Authenticated: call API
    try {
      const result = await apiToggleWishlist(productId);
      // Reconcile with server truth — server toggle might differ from optimistic
      const reconciledIds = result.in_wishlist
        ? [...get().ids.filter((id) => id !== productId), productId]
        : get().ids.filter((id) => id !== productId);
      set({ ids: reconciledIds, count: result.count });
      toast.success(
        result.in_wishlist
          ? productName
            ? `"${productName}" saved to wishlist`
            : 'Added to wishlist'
          : 'Removed from wishlist',
      );
    } catch (e) {
      // Revert
      set({ ids: prevIds, count: prevIds.length });
      toast.error(e instanceof ApiError ? e.message : 'Failed to update wishlist');
    } finally {
      set((s) => {
        const next = new Set(s.pendingIds);
        next.delete(productId);
        return { pendingIds: next };
      });
    }
  },

  // ── remove ─────────────────────────────────────────────────────────────────
  remove: async (productId) => {
    const prevIds = get().ids;
    const nextIds = prevIds.filter((id) => id !== productId);

    // Optimistic update
    set({ ids: nextIds, count: nextIds.length });

    const isAuthenticated = !!tokenCache.get();

    if (!isAuthenticated) {
      saveGuestIds(nextIds);
      return;
    }

    try {
      const result = await apiRemoveFromWishlist(productId);
      set({ count: result.count });
    } catch (e) {
      set({ ids: prevIds, count: prevIds.length });
      toast.error(e instanceof ApiError ? e.message : 'Failed to remove from wishlist');
    }
  },

  // ── hydrate ─────────────────────────────────────────────────────────────────
  hydrate: async (isAuthenticated) => {
    if (get().hydrated) return;
    try {
      if (isAuthenticated) {
        const { products, meta } = await apiGetWishlist(1, 100);
        const ids = products.map((p) => p.id);
        set({ ids, count: meta.total ?? ids.length });
      } else {
        const ids = loadGuestIds();
        set({ ids, count: ids.length });
      }
    } catch {
      // Silently fail — wishlist heart buttons will show un-wishlisted state
    } finally {
      set({ hydrated: true });
    }
  },

  // ── syncGuestWishlist ────────────────────────────────────────────────────────
  syncGuestWishlist: async () => {
    const guestIds = loadGuestIds();

    // Fetch current server wishlist to avoid double-toggling items already present
    let serverIds: number[] = [];
    try {
      const { products } = await apiGetWishlist(1, 100);
      serverIds = products.map((p) => p.id);
    } catch {
      // Continue without server state — best-effort sync
    }

    const idsToAdd = guestIds.filter((id) => !serverIds.includes(id));

    if (idsToAdd.length > 0) {
      await Promise.allSettled(idsToAdd.map((id) => apiToggleWishlist(id)));
    }

    clearGuestIds();

    // Re-fetch to get the canonical server state
    try {
      const { products, meta } = await apiGetWishlist(1, 100);
      const ids = products.map((p) => p.id);
      set({ ids, count: meta.total ?? ids.length, hydrated: true });
    } catch {
      // Fall back to merged local state
      const finalIds = Array.from(new Set([...serverIds, ...idsToAdd]));
      set({ ids: finalIds, count: finalIds.length, hydrated: true });
    }
  },
}));
