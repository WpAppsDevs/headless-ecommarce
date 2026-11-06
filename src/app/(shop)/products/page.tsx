import { getProducts, MAX_PER_PAGE } from '@/lib/api/products';
import type { Product } from '@/lib/api/products';
import { getProductFilters } from '@/lib/api/filters';
import { ShopClient } from '@/components/shop/ShopClient';
import { PageHeader } from '@/components/ui/PageHeader';
import type { BreadcrumbItem } from '@/components/ui/PageHeader';
import { selectReadyStockPage } from '@/lib/ready-stock-page';
import { READY_STOCK_TAG } from '@/lib/product-availability';

export const revalidate = 60;

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string; tag?: string; brand?: string }>;
}

interface CollectionQuery {
  category?: string;
  search?: string;
  tag?: string;
  brand?: string;
}

/** Fetch every page of the tagged set so sold-out products cannot hide a page. */
async function fetchReadyStockProducts(query: CollectionQuery): Promise<Product[]> {
  const first = await getProducts({ ...query, page: 1, per_page: MAX_PER_PAGE });
  if (first.meta.total_pages <= 1) return first.items;

  const remaining = await Promise.all(
    Array.from({ length: first.meta.total_pages - 1 }, (_, index) =>
      getProducts({ ...query, page: index + 2, per_page: MAX_PER_PAGE }),
    ),
  );

  return [...first.items, ...remaining.flatMap((result) => result.items)];
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const category = params.category?.trim() || undefined;
  const search = params.search?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const brand = params.brand?.trim() || undefined;

  // The Ready Stock collection drops sold-out products after the API has
  // paginated, so fetch the tagged set in one pass and paginate it here.
  const isReadyStockCollection = tag === READY_STOCK_TAG;
  const productRequest = isReadyStockCollection
    ? fetchReadyStockProducts({ category, search, tag, brand }).then((products) =>
        selectReadyStockPage(products, page, PAGE_SIZE),
      )
    : getProducts({ page, per_page: PAGE_SIZE, category, search, tag, brand });

  const [result, filters] = await Promise.all([
    productRequest.catch(
      () => ({ items: [], meta: { page: 1, per_page: PAGE_SIZE, total: 0, total_pages: 1 } }),
    ),
    getProductFilters().catch(() => ({
      categories: [],
      tags: [],
      brands: [],
      colorTerms: [],
      sizeTerms: [],
    })),
  ]);

  const { items, meta } = result;

  const categoryLabel = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...(categoryLabel
      ? [{ label: 'Shop', href: '/products' }, { label: categoryLabel }]
      : [{ label: 'Shop' }]),
  ];

  return (
    <>
      <PageHeader title={categoryLabel ?? 'Shop'} breadcrumbs={breadcrumbs} />
      <ShopClient
        initialProducts={items}
        meta={meta}
        initialCategory={category}
        initialSearch={search}
        initialTag={tag}
        initialBrand={brand}
        serverPage={meta.page}
        filters={filters}
      />
    </>
  );
}
