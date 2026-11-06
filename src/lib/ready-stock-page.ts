import type { PaginationMeta, Product } from '@/lib/api/products';
import { isReadyStock } from '@/lib/product-availability';

/**
 * Selects one page of the stock-backed Ready Stock collection.
 *
 * The API paginates before the storefront can drop sold-out products, so the
 * collection is fetched in one pass and paginated here. Everything else keeps
 * the server's own pagination.
 */
export function selectReadyStockPage(
  products: Product[],
  page: number,
  perPage: number,
): { items: Product[]; meta: PaginationMeta } {
  const readyStock = products.filter(isReadyStock);
  const total = readyStock.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: readyStock.slice(start, start + perPage),
    meta: {
      page: safePage,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
  };
}
