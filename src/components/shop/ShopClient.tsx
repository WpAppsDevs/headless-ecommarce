'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, PaginationMeta, ProductCategory } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopSidebar } from '@/components/shop/ShopSidebar';
import { ShopTopBar, type SortOrder } from '@/components/shop/ShopTopBar';

interface ShopClientProps {
  initialProducts: Product[];
  meta: PaginationMeta;
  initialCategory?: string;
  initialSearch?: string;
  serverPage: number;
}

function gridColsClass(cols: 2 | 3 | 4) {
  if (cols === 2) return 'grid grid-cols-2 gap-4';
  if (cols === 3) return 'grid grid-cols-2 gap-4 sm:grid-cols-3';
  return 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4';
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Search className="h-12 w-12 text-zinc-300 mb-4" />
      <h3 className="text-lg font-semibold text-zinc-700 mb-1">No products found</h3>
      <p className="text-sm text-zinc-400 mb-6">Try adjusting your filters.</p>
      <button
        onClick={onClear}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all duration-150"
      >
        Clear Filters
      </button>
    </div>
  );
}

export function ShopClient({
  initialProducts,
  meta,
  initialCategory,
  initialSearch,
  serverPage,
}: ShopClientProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [activePriceRange, setActivePriceRange] = useState<[number, number]>([0, 9999]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [viewCols, setViewCols] = useState<2 | 3 | 4>(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const priceRange = useMemo<[number, number]>(() => {
    if (!initialProducts.length) return [0, 9999];
    const prices = initialProducts.map((p) => parseFloat(p.price) || 0);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [initialProducts]);

  const categories = useMemo<ProductCategory[]>(() => {
    const seen = new Set<number>();
    const result: ProductCategory[] = [];
    for (const product of initialProducts) {
      for (const cat of product.categories) {
        if (!seen.has(cat.id)) {
          seen.add(cat.id);
          result.push(cat);
        }
      }
    }
    return result;
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let list = initialProducts.filter((p) => {
      const price = parseFloat(p.price) || 0;
      return price >= activePriceRange[0] && price <= activePriceRange[1];
    });

    if (sortOrder === 'price-asc') {
      list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOrder === 'price-desc') {
      list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOrder === 'latest') {
      list = [...list].sort((a, b) => b.id - a.id);
    }

    return list;
  }, [initialProducts, activePriceRange, sortOrder]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activePriceRange[0] !== priceRange[0] || activePriceRange[1] !== priceRange[1]) count += 1;
    count += selectedColors.length;
    count += selectedSizes.length;
    return count;
  }, [activePriceRange, priceRange, selectedColors, selectedSizes]);

  function handleClearAll() {
    setActivePriceRange(priceRange);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortOrder('default');
  }

  function handleColorToggle(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }

  function handleSizeToggle(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    if (p > 1) qs.set('page', String(p));
    if (initialCategory) qs.set('category', initialCategory);
    if (initialSearch) qs.set('search', initialSearch);
    const q = qs.toString();
    return `/products${q ? `?${q}` : ''}`;
  }

  // Build visible page numbers (up to 5 around current)
  function getPageNumbers(current: number, total: number): number[] {
    const pages: number[] = [];
    const delta = 2;
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }

  const categoryLabel = initialCategory
    ? initialCategory.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const sidebarProps = {
    categories,
    selectedCategory: initialCategory ?? '',
    priceRange,
    activePriceRange,
    onPriceRangeChange: setActivePriceRange,
    selectedColors,
    onColorToggle: handleColorToggle,
    selectedSizes,
    onSizeToggle: handleSizeToggle,
    onClearAll: handleClearAll,
    activeFilterCount,
    currentSearch: initialSearch,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        {/* Breadcrumbs */}
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-zinc-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-zinc-700 transition-all duration-150">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-700 transition-all duration-150">Shop</Link>
          {categoryLabel && (
            <>
              <span>/</span>
              <span className="text-zinc-600">{categoryLabel}</span>
            </>
          )}
        </nav>

        <h1 className="text-3xl font-bold text-zinc-900">{categoryLabel ?? 'Shop'}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {meta.total} product{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="text-zinc-500 hover:text-zinc-700 transition-all duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ShopSidebar {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-8 mt-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <ShopSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          <ShopTopBar
            total={filteredProducts.length}
            page={serverPage}
            perPage={meta.per_page}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            viewCols={viewCols}
            onViewColsChange={setViewCols}
            mobileFiltersOpen={mobileFiltersOpen}
            onMobileFiltersToggle={() => setMobileFiltersOpen((v) => !v)}
            activeFilterCount={activeFilterCount}
          />

          {filteredProducts.length === 0 ? (
            <EmptyState onClear={handleClearAll} />
          ) : (
            <div className={gridColsClass(viewCols)}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Server-side pagination */}
          {meta.total_pages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-10 flex items-center justify-center gap-1.5"
            >
              {serverPage > 1 ? (
                <Link
                  href={pageHref(serverPage - 1)}
                  className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-all duration-150"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span className="h-8 w-8 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-300">
                  <ChevronLeft className="h-4 w-4" />
                </span>
              )}

              {getPageNumbers(serverPage, meta.total_pages).map((p) =>
                p === serverPage ? (
                  <span
                    key={p}
                    className="bg-zinc-900 text-white rounded-lg px-3 py-1.5 text-sm font-medium"
                    aria-current="page"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm border border-zinc-200 hover:bg-zinc-50 transition-all duration-150',
                    )}
                  >
                    {p}
                  </Link>
                ),
              )}

              {serverPage < meta.total_pages ? (
                <Link
                  href={pageHref(serverPage + 1)}
                  className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-all duration-150"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="h-8 w-8 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-300">
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
