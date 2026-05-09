import { config } from '@/lib/config';
import { ApiError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductImage {
  id: number;
  /** Primary image URL — matches the `src` field returned by the API. */
  src: string;
  alt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
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
  /** Keyed by attribute slug (e.g. `{ pa_size: "M", pa_color: "Red" }`). */
  attributes: Record<string, string>;
  /** Primary image URL for this variation. */
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
  average_rating?: string;
  rating_count?: number;
  categories: ProductCategory[];
  images: ProductImage[];
  attributes: ProductAttribute[];
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
// Internal raw types (API shape before normalization)
// ---------------------------------------------------------------------------

interface RawVariationAttribute {
  id: number;
  name: string;
  option: string;
}

interface RawVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  image: { id: number; src: string; name: string; alt: string } | null;
  attributes: RawVariationAttribute[];
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

/**
 * Normalizes a raw API variation into the shape components expect.
 * - `attributes`: `[{ id, name, option }]` → `Record<slug, option>`
 * - `image`: `{ src }` object → URL string
 */
function normalizeVariation(
  raw: RawVariation,
  attrSlugMap: Map<number, string>,
): ProductVariation {
  const attributes: Record<string, string> = {};
  for (const attr of raw.attributes ?? []) {
    const slug =
      attrSlugMap.get(attr.id) ??
      `pa_${attr.name.toLowerCase().replace(/\s+/g, '_')}`;
    attributes[slug] = attr.option;
  }
  return {
    id: raw.id,
    sku: raw.sku ?? '',
    price: raw.price ?? '',
    regular_price: raw.regular_price ?? '',
    sale_price: raw.sale_price ?? '',
    on_sale: raw.on_sale ?? false,
    stock_status: (raw.stock_status as ProductVariation['stock_status']) ?? 'instock',
    stock_quantity: raw.stock_quantity ?? null,
    manage_stock: raw.manage_stock ?? false,
    attributes,
    image: raw.image?.src ?? '',
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getProducts(params: {
  page?: number;
  per_page?: number;
  category?: string;
  brand?: string;
  tag?: string;
  search?: string;
}): Promise<{ items: Product[]; meta: PaginationMeta }> {
  const { page = 1, per_page = 12, category, brand, tag, search } = params;
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(Math.min(per_page, 100)),
    ...(category ? { category } : {}),
    ...(brand ? { brand } : {}),
    ...(tag ? { tag } : {}),
    ...(search ? { search } : {}),
  });
  const json = await wpFetch<{ success: boolean; data: Product[]; meta: PaginationMeta }>(
    `${base()}/products?${qs}`,
    { next: { revalidate: 60 } },
  );
  return { items: json.data, meta: json.meta };
}

export async function getProduct(slug: string): Promise<Product> {
  const json = await wpFetch<{
    success: boolean;
    data: Omit<Product, 'variations'> & {
      attributes: ProductAttribute[];
      variations: (number | RawVariation)[];
    };
  }>(
    `${base()}/products/${slug}`,
    { next: { revalidate: 60 } },
  );
  const raw = json.data;

  // Build attribute id → slug map for variation normalisation
  const attrSlugMap = new Map<number, string>(
    (raw.attributes ?? []).map((a) => [a.id, a.slug]),
  );

  const variations = (raw.variations ?? []).map((v) =>
    typeof v === 'number' ? v : normalizeVariation(v, attrSlugMap),
  );

  return { ...raw, variations } as Product;
}

/** Fetches all product slugs across all pages — used for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  // Skip static pre-generation if the API URL is not configured (e.g. fresh Vercel deploy)
  if (!process.env.NEXT_PUBLIC_WP_URL) return [];
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
