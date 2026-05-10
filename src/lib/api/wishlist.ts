import { apiClient, tokenCache } from './client';
import { config } from '@/lib/config';
import { ApiError } from '@/lib/errors';
import type { Product, PaginationMeta } from './products';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WishlistToggleResult {
  in_wishlist: boolean;
  count: number;
}

export interface WishlistCheckResult {
  product_id: number;
  in_wishlist: boolean;
  count: number;
}

export interface WishlistRemoveResult {
  product_id: number;
  in_wishlist: boolean;
  count: number;
}

export interface WishlistMeta extends PaginationMeta {
  count: number;
}

export interface WishlistListResult {
  products: Product[];
  meta: WishlistMeta;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wishlist endpoints live under the 'api' namespace, not 'wpadhlwrapi/v1'. */
const ns = config.apiNs; // 'api'

/** Normalize raw image objects (API may return url instead of src). */
function normalizeImage(img: Record<string, unknown>) {
  return {
    id: (img.id as number) ?? 0,
    src: (img.src as string) || (img.url as string) || '',
    alt: (img.alt as string) ?? '',
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * POST /wp-json/api/wishlist
 * Toggles the wishlist state: adds if absent, removes if present.
 */
export async function apiToggleWishlist(productId: number): Promise<WishlistToggleResult> {
  return apiClient<WishlistToggleResult>(`${ns}/wishlist`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  });
}

/**
 * DELETE /wp-json/api/wishlist/{product_id}
 * Idempotent remove — HTTP 200 even if product was not in the wishlist.
 */
export async function apiRemoveFromWishlist(productId: number): Promise<WishlistRemoveResult> {
  return apiClient<WishlistRemoveResult>(`${ns}/wishlist/${productId}`, {
    method: 'DELETE',
  });
}

/**
 * GET /wp-json/api/wishlist/check/{product_id}
 * Lightweight status check with no product data fetch.
 */
export async function apiCheckWishlist(productId: number): Promise<WishlistCheckResult> {
  return apiClient<WishlistCheckResult>(`${ns}/wishlist/check/${productId}`);
}

/**
 * GET /wp-json/api/wishlist
 * Returns full product objects with pagination meta.
 *
 * We fetch directly instead of going through apiClient because parseBody strips
 * the `meta` field by returning only `body.data`. Both `data` (products) and
 * `meta` (total count / pages) are needed here.
 */
export async function apiGetWishlist(page = 1, per_page = 50): Promise<WishlistListResult> {
  const token = tokenCache.get();
  const qs = new URLSearchParams({ page: String(page), per_page: String(per_page) });

  const res = await fetch(`${config.apiBase}/${ns}/wishlist?${qs}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }

  // Normalize image src/url field (same issue as products endpoint)
  const products: Product[] = (Array.isArray(json.data) ? json.data : []).map(
    (p: Record<string, unknown>) => ({
      ...p,
      images: (Array.isArray(p.images) ? (p.images as Record<string, unknown>[]) : []).map(
        normalizeImage,
      ),
      categories: Array.isArray(p.categories) ? p.categories : [],
      attributes: Array.isArray(p.attributes) ? p.attributes : [],
      variations: Array.isArray(p.variations) ? p.variations : [],
    }),
  );

  return { products, meta: json.meta as WishlistMeta };
}
