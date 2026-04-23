import { getProducts } from '@/lib/api/products';
import { ShopClient } from '@/components/shop/ShopClient';
import { PageHeader } from '@/components/ui/PageHeader';
import type { BreadcrumbItem } from '@/components/ui/PageHeader';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const category = params.category?.trim() || undefined;
  const search = params.search?.trim() || undefined;

  const { items, meta } = await getProducts({ page, per_page: 12, category, search }).catch(
    () => ({ items: [], meta: { page: 1, per_page: 12, total: 0, total_pages: 1 } }),
  );

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
        serverPage={page}
      />
    </>
  );
}
