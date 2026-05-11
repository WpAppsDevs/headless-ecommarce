import { getProducts } from '@/lib/api/products';
import { getProductFilters } from '@/lib/api/filters';
import { ShopClient } from '@/components/shop/ShopClient';
import { PageHeader } from '@/components/ui/PageHeader';
import type { BreadcrumbItem } from '@/components/ui/PageHeader';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string; tag?: string; brand?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const category = params.category?.trim() || undefined;
  const search = params.search?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const brand = params.brand?.trim() || undefined;

  const [{ items, meta }, filters] = await Promise.all([
    getProducts({ page, per_page: 12, category, search, tag, brand }).catch(
      () => ({ items: [], meta: { page: 1, per_page: 12, total: 0, total_pages: 1 } }),
    ),
    getProductFilters().catch(() => ({
      categories: [],
      tags: [],
      brands: [],
      colorTerms: [],
      sizeTerms: [],
    })),
  ]);

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
        serverPage={page}
        filters={filters}
      />
    </>
  );
}
