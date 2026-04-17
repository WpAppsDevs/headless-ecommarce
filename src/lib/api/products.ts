import { config } from '@/lib/config';
import { ApiError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock: boolean;
  attributes: Record<string, string>;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type: 'simple' | 'variable';
  status?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock?: boolean;
  categories: ProductCategory[];
  images: ProductImage[];
  /** List endpoint returns variation IDs; detail endpoint returns full objects. */
  variations: number[] | ProductVariation[];
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const base = () => `${config.apiBase}/${config.productsNs}`;

async function wpFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getProducts(params: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}): Promise<{ items: Product[]; meta: PaginationMeta }> {
  const { page = 1, per_page = 12, category, search } = params;
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(Math.min(per_page, 100)),
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
  });
  const json = await wpFetch<{ success: boolean; data: Product[]; meta: PaginationMeta }>(
    `${base()}/products?${qs}`,
    { next: { revalidate: 60 } },
  );
  return { items: json.data, meta: json.meta };
}

export async function getProduct(slug: string): Promise<Product> {
  const json = await wpFetch<{ success: boolean; data: Product }>(
    `${base()}/products/${slug}`,
    { next: { revalidate: 60 } },
  );
  return json.data;
}

/** Fetches all product slugs across all pages — used for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  while (true) {
    const { items, meta } = await getProducts({ page, per_page: 100 });
    slugs.push(...items.map((p) => p.slug));
    if (page >= meta.total_pages) break;
    page++;
  }
  return slugs;
}
