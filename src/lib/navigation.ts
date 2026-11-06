interface ReadonlySearchParams {
  get(name: string): string | null;
  has(name: string): boolean;
}

const SHOP_FILTER_KEYS = [
  'page',
  'category',
  'tag',
  'brand',
  'search',
  'price',
  'color',
  'colour',
  'size',
];

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/**
 * Whether a navigation link is the active one for the current URL.
 *
 * A link with a query string must match its path exactly and every query pair.
 * This keeps product-detail pages and competing collection links from
 * highlighting at the same time.
 */
export function isNavLinkActive(
  pathname: string,
  search: ReadonlySearchParams,
  href: string,
): boolean {
  if (!href.startsWith('/')) return false;

  const [pathAndQuery] = href.split('#');
  const [rawPath, query = ''] = pathAndQuery.split('?');
  const hrefPath = normalizePath(rawPath);
  const currentPath = normalizePath(pathname);

  if (hrefPath === '/') return currentPath === '/';

  if (query) {
    if (currentPath !== hrefPath) return false;

    for (const [key, value] of new URLSearchParams(query)) {
      if (search.get(key) !== value) return false;
    }
    return true;
  }

  // A plain /products link is All Products, not a collection or a product.
  if (hrefPath === '/products') {
    return currentPath === '/products' && !search.has('tag');
  }

  return currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`);
}

/** Removes every shop filter while preserving unrelated parameters. */
export function clearShopFilters(search: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(search);
  for (const key of SHOP_FILTER_KEYS) next.delete(key);
  return next;
}

export function buildShopHref(search: URLSearchParams): string {
  const query = search.toString();
  return `/products${query ? `?${query}` : ''}`;
}

export interface ShopFilterHref {
  page?: number | null;
  category?: string | null;
  tag?: string | null;
  brand?: string | null;
  search?: string | null;
}

/** Builds a shop URL from the filters a collection control can change. */
export function buildShopFilterHref(filters: ShopFilterHref = {}): string {
  const query = new URLSearchParams();
  if (filters.page && filters.page > 1) query.set('page', String(filters.page));
  if (filters.category) query.set('category', filters.category);
  if (filters.tag) query.set('tag', filters.tag);
  if (filters.brand) query.set('brand', filters.brand);
  if (filters.search) query.set('search', filters.search);
  return buildShopHref(query);
}
