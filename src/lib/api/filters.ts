import { config } from '@/lib/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  image: string | null;
}

export interface FilterTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface FilterBrand {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: string | null;
}

export interface FilterAttributeTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface FilterAttribute {
  id: number;
  name: string;
  slug: string;
  terms: FilterAttributeTerm[];
}

export interface ProductFilters {
  categories: FilterCategory[];
  tags: FilterTag[];
  brands: FilterBrand[];
  /** Terms from the `pa_color` WooCommerce attribute */
  colorTerms: FilterAttributeTerm[];
  /** Terms from the `pa_size` WooCommerce attribute */
  sizeTerms: FilterAttributeTerm[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const base = () => `${config.apiBase}/${config.productsNs}`;

/** Fetches a list endpoint; returns [] on 404 / network error / parse error. */
async function safeFetchArray<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 21600 } }); // 6 h cache
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? (json.data as T[]) : [];
  } catch {
    return [];
  }
}

/** Fetches a keyed-object endpoint; returns {} on 404 / network error. */
async function safeFetchObject<T extends object>(url: string): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate: 21600 } }); // 6 h cache
    if (!res.ok) return {} as T;
    const json = await res.json();
    return (json?.data ?? {}) as T;
  } catch {
    return {} as T;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches all sidebar filter data in parallel from WordPress.
 * Every request has a 6-hour revalidation cache.
 * Any endpoint that returns 404 (not yet deployed) silently returns an
 * empty collection — the app stays functional with no visible filters.
 */
export async function getProductFilters(): Promise<ProductFilters> {
  const [categories, tags, brands, attributes] = await Promise.all([
    safeFetchArray<FilterCategory>(`${base()}/product-categories`),
    safeFetchArray<FilterTag>(`${base()}/product-tags`),
    safeFetchArray<FilterBrand>(`${base()}/product-brands`),
    safeFetchObject<Record<string, FilterAttribute>>(`${base()}/product-attributes`),
  ]);

  return {
    categories,
    tags,
    brands,
    colorTerms: attributes['pa_color']?.terms ?? [],
    sizeTerms:  attributes['pa_size']?.terms  ?? [],
  };
}
