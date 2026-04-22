import { apiClient } from './client';
import { config } from '@/lib/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  product_name: string;
  product_image: string;
  id: string;
  cart_token: string;
  user_id: string | null;
  product_id: string;
  variation_id: string;
  quantity: string;
  meta: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartData {
  items: CartItem[];
  /** UUID identifying the cart row in the DB. */
  cart_token: string | null;
  /** JWT — only present on the FIRST successful add for a new guest session. */
  guest_token?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ns = config.productsNs; // 'wpadhlwrapi/v1'

/**
 * Returns the guest cart JWT from localStorage (if present).
 * When undefined, apiClient falls back to tokenCache (access_token for
 * logged-in users) or sends no Authorization header at all (new guest).
 */
function getGuestToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('cart_token') ?? undefined;
}

// ---------------------------------------------------------------------------
// Cart API functions
// ---------------------------------------------------------------------------

/** POST /wpadhlwrapi/v1/cart/add */
export async function apiAddToCart(
  productId: number,
  variationId = 0,
  quantity = 1,
): Promise<CartData> {
  return apiClient<CartData>(`${ns}/cart/add`, {
    method: 'POST',
    token: getGuestToken(),
    body: JSON.stringify({ product_id: productId, variation_id: variationId, quantity }),
  });
}

/** GET /wpadhlwrapi/v1/cart */
export async function apiGetCart(): Promise<CartData> {
  return apiClient<CartData>(`${ns}/cart`, {
    token: getGuestToken(),
  });
}

/** PUT /wpadhlwrapi/v1/cart/update */
export async function apiUpdateCartItem(
  itemId: number,
  quantity: number,
): Promise<CartData> {
  return apiClient<CartData>(`${ns}/cart/update`, {
    method: 'PUT',
    token: getGuestToken(),
    body: JSON.stringify({ item_id: itemId, quantity }),
  });
}

/** DELETE /wpadhlwrapi/v1/cart/remove */
export async function apiRemoveCartItem(itemId: number): Promise<CartData> {
  return apiClient<CartData>(`${ns}/cart/remove`, {
    method: 'DELETE',
    token: getGuestToken(),
    body: JSON.stringify({ item_id: itemId }),
  });
}
