import type { PaginationMeta, Product, ProductCollectionQuery } from '@/lib/api/products';
import { isReadyStock, READY_STOCK_TAG } from '@/lib/product-availability';

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

/**
 * The collection-wide fallback is only right for the unfiltered Ready Stock
 * page. A search or category with no matches is a normal empty result.
 */
export function shouldShowReadyStockFallback({
  query,
  productCount,
}: {
  query: ProductCollectionQuery;
  productCount: number;
}): boolean {
  const { tag, category, search, brand } = query;
  return (
    tag === READY_STOCK_TAG &&
    !category &&
    !search &&
    !brand &&
    productCount === 0
  );
}
