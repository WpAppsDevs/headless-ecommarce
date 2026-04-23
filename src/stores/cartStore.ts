import { create } from 'zustand';
import {
  apiAddToCart,
  apiGetCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  type CartItem,
} from '@/lib/api/cart';
import { ApiError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartState {
  items: CartItem[];
  /** UUID cart identifier returned by every cart endpoint. */
  cartToken: string | null;
  /** Guest JWT stored in localStorage['cart_token']. Null for logged-in users. */
  guestToken: string | null;
  loading: boolean;
  error: string | null;
  cartDrawerOpen: boolean;
}

interface CartActions {
  /** Fetch the current cart (guest or user). */
  fetchCart: () => Promise<void>;
  /** Add a product to the cart. Saves guest_token on the very first add. */
  addItem: (productId: number, variationId: number, quantity: number, attributes?: Record<string, string>) => Promise<void>;
  /** Set a new absolute quantity for an existing line item. */
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  /** Remove a line item from the cart. */
  removeItem: (itemId: number) => Promise<void>;
  /** Clear guest JWT from localStorage and state (called on login/register). */
  clearGuestToken: () => void;
  /** Reset items to [] — call after successful order confirmation. */
  clearCart: () => void;
  setCartDrawerOpen: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toErrorMsg(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    if (e.code === 'out_of_stock') return 'This item is out of stock';
    return e.message;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCartStore = create<CartState & CartActions>((set) => ({
  // ── Initial state ─────────────────────────────────────────────────────────
  items: [],
  cartToken: null,
  // Restore guestToken from localStorage on first client-side render.
  guestToken:
    typeof window !== 'undefined' ? localStorage.getItem('cart_token') : null,
  loading: false,
  error: null,
  cartDrawerOpen: false,

  // ── Actions ───────────────────────────────────────────────────────────────

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiGetCart();
      set({ items: data.items, cartToken: data.cart_token, loading: false });
    } catch (e) {
      set({ error: toErrorMsg(e, 'Failed to fetch cart'), loading: false });
    }
  },

  addItem: async (productId, variationId, quantity, attributes) => {
    set({ loading: true, error: null });
    try {
      const data = await apiAddToCart(productId, variationId, quantity, attributes);

      // guest_token only appears in the FIRST add response for a new session.
      // Never overwrite an existing token (subsequent adds omit guest_token).
      if (
        data.guest_token &&
        typeof window !== 'undefined' &&
        !localStorage.getItem('cart_token')
      ) {
        localStorage.setItem('cart_token', data.guest_token);
        set({ guestToken: data.guest_token });
      }

      set({ items: data.items, cartToken: data.cart_token, loading: false });
    } catch (e) {
      set({ error: toErrorMsg(e, 'Failed to add item to cart'), loading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      const data = await apiUpdateCartItem(itemId, quantity);
      set({ items: data.items, cartToken: data.cart_token, loading: false });
    } catch (e) {
      set({ error: toErrorMsg(e, 'Failed to update cart'), loading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRemoveCartItem(itemId);
      set({ items: data.items, cartToken: data.cart_token, loading: false });
    } catch (e) {
      set({ error: toErrorMsg(e, 'Failed to remove item from cart'), loading: false });
    }
  },

  clearGuestToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart_token');
    }
    set({ guestToken: null });
  },

  clearCart: () => {
    set({ items: [], cartToken: null });
  },

  setCartDrawerOpen: (open) => {
    set({ cartDrawerOpen: open });
  },
}));
