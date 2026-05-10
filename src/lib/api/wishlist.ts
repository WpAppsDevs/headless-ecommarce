import { tokenCache } from './client';
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

/** Normalize raw image objects (API may return url instead of src). */
function normalizeImage(img: Record<string, unknown>) {
  return {
    id: (img.id as number) ?? 0,
    src: (img.src as string) || (img.url as string) || '',
    alt: (img.alt as string) ?? '',
  };
}

/** Build auth header from in-memory tokenCache. */
function authHeader(): Record<string, string> {
  const token = tokenCache.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------------------
// API functions — all call Next.js proxy routes (/api/wishlist/*)
// to avoid CORS issues with the WordPress API.
// ---------------------------------------------------------------------------

/**
 * POST /api/wishlist
 * Toggles the wishlist state: adds if absent, removes if present.
 */
export async function apiToggleWishlist(productId: number): Promise<WishlistToggleResult> {
  const res = await fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ product_id: productId }),
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }
  return (json?.data ?? json) as WishlistToggleResult;
}

/**
 * DELETE /api/wishlist/{product_id}
 * Idempotent remove — HTTP 200 even if product was not in the wishlist.
 */
export async function apiRemoveFromWishlist(productId: number): Promise<WishlistRemoveResult> {
  const res = await fetch(`/api/wishlist/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }
  return (json?.data ?? json) as WishlistRemoveResult;
}

/**
 * GET /api/wishlist/check/{product_id}
 * Lightweight status check with no product data fetch.
 */
export async function apiCheckWishlist(productId: number): Promise<WishlistCheckResult> {
  const res = await fetch(`/api/wishlist/check/${productId}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }
  return (json?.data ?? json) as WishlistCheckResult;
}

/**
 * GET /api/wishlist?page=&per_page=
 * Returns full product objects with pagination meta.
 */
export async function apiGetWishlist(page = 1, per_page = 50): Promise<WishlistListResult> {
  const qs = new URLSearchParams({ page: String(page), per_page: String(per_page) });

  const res = await fetch(`/api/wishlist?${qs}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }

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
