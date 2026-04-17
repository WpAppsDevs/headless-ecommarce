import Link from 'next/link';
import { getProducts } from '@/lib/api/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SearchBar } from '@/components/product/SearchBar';

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

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    if (p > 1) qs.set('page', String(p));
    if (category) qs.set('category', category);
    if (search) qs.set('search', search);
    const q = qs.toString();
    return `/products${q ? `?${q}` : ''}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Products</h1>
        {(category || search) && (
          <p className="text-sm text-muted-foreground">
            {search && <>Searching for &ldquo;{search}&rdquo;</>}
            {category && search && ' in '}
            {category && <span className="capitalize">{category.replace(/-/g, ' ')}</span>}
            {' · '}
            <Link href="/products" className="hover:underline">
              Clear filters
            </Link>
          </p>
        )}
      </div>

      <SearchBar defaultValue={search} />

      <div className="mt-6">
        <ProductGrid products={items} />
      </div>

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.total_pages}
          </span>
          {page < meta.total_pages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
