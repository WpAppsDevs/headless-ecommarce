'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, PaginationMeta } from '@/lib/api/products';
import type { ProductFilters } from '@/lib/api/filters';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopSidebar } from '@/components/shop/ShopSidebar';
import { ShopTopBar, type SortOrder } from '@/components/shop/ShopTopBar';

interface ShopClientProps {
  initialProducts: Product[];
  meta: PaginationMeta;
  initialCategory?: string;
  initialSearch?: string;
  initialTag?: string;
  initialBrand?: string;
  serverPage: number;
  filters: ProductFilters;
}

function gridColsClass(cols: 2 | 3 | 4) {
  if (cols === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6';
  if (cols === 3) return 'grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6';
  return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6';
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
        <Search className="h-8 w-8 text-zinc-300" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">No products found</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        Try adjusting your filters or search terms to find what you're looking for.
      </p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
      >
        <X className="h-4 w-4" />
        Clear all filters
      </button>
    </div>
  );
}

export function ShopClient({
  initialProducts,
  meta,
  initialCategory,
  initialSearch,
  initialTag,
  initialBrand,
  serverPage,
  filters,
}: ShopClientProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [activePriceRange, setActivePriceRange] = useState<[number, number] | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [viewCols, setViewCols] = useState<2 | 3 | 4>(3);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const priceRange = useMemo<[number, number]>(() => {
    if (!initialProducts.length) return [0, 9999];
    const prices = initialProducts.map((p) => parseFloat(p.price) || 0);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [initialProducts]);

  const derivedCategories = useMemo(() => {
    const seen = new Set<number>();
    const result: Array<{ id: number; name: string; slug: string; count?: number }> = [];
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

  const categories = filters.categories.length > 0 ? filters.categories : derivedCategories;

  const filteredProducts = useMemo(() => {
    const effectivePriceRange = activePriceRange ?? priceRange;
    let list = initialProducts.filter((p) => {
      const price = parseFloat(p.price) || 0;
      if (price < effectivePriceRange[0] || price > effectivePriceRange[1]) return false;

      if (selectedColors.length > 0) {
        const colorAttr = (Array.isArray(p.attributes) ? p.attributes : [])
          .find((a) => a.slug === 'pa_color');
        if (!colorAttr) return false;
        const hasColor = selectedColors.some((slug) =>
          colorAttr.options.some((o) => o.toLowerCase() === slug.toLowerCase()),
        );
        if (!hasColor) return false;
      }

      if (selectedSizes.length > 0) {
        const sizeAttr = (Array.isArray(p.attributes) ? p.attributes : [])
          .find((a) => a.slug === 'pa_size');
        if (!sizeAttr) return false;
        const hasSize = selectedSizes.some((slug) =>
          sizeAttr.options.some((o) => o.toLowerCase() === slug.toLowerCase()),
        );
        if (!hasSize) return false;
      }

      return true;
    });

    if (sortOrder === 'price-asc') {
      list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOrder === 'price-desc') {
      list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOrder === 'latest') {
      list = [...list].sort((a, b) => b.id - a.id);
    }

    return list;
  }, [initialProducts, activePriceRange, priceRange, selectedColors, selectedSizes, sortOrder]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (initialCategory) count += 1;
    if (initialTag) count += 1;
    if (initialBrand) count += 1;
    if (activePriceRange !== null && (activePriceRange[0] !== priceRange[0] || activePriceRange[1] !== priceRange[1])) count += 1;
    count += selectedColors.length;
    count += selectedSizes.length;
    return count;
  }, [initialCategory, initialTag, initialBrand, activePriceRange, priceRange, selectedColors, selectedSizes]);

  function handleClearAll() {
    setActivePriceRange(null);
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
    if (initialTag) qs.set('tag', initialTag);
    if (initialBrand) qs.set('brand', initialBrand);
    const q = qs.toString();
    return `/products${q ? `?${q}` : ''}`;
  }

  function getPageNumbers(current: number, total: number): number[] {
    const pages: number[] = [];
    const delta = 2;
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }

  const sidebarProps = {
    categories,
    tags: filters.tags,
    brands: filters.brands,
    colorTerms: filters.colorTerms,
    sizeTerms: filters.sizeTerms,
    selectedCategory: initialCategory ?? '',
    selectedTag: initialTag ?? '',
    selectedBrand: initialBrand ?? '',
    priceRange,
    activePriceRange: activePriceRange ?? priceRange,
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
      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-zinc-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-zinc-900" />
                <h2 className="text-lg font-semibold text-zinc-900">Filters</h2>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="h-9 w-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <ShopSidebar {...sidebarProps} />
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
              <Filter className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Filters</h2>
            </div>
            <ShopSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <ShopTopBar
            total={meta.total}
            filteredTotal={filteredProducts.length}
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
            <>
              <div className={gridColsClass(viewCols)}>
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {meta.total_pages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-1.5"
                >
                  {serverPage > 1 ? (
                    <Link
                      href={pageHref(serverPage - 1)}
                      className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="h-9 w-9 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-300 cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4" />
                    </span>
                  )}

                  {getPageNumbers(serverPage, meta.total_pages).map((p) =>
                    p === serverPage ? (
                      <span
                        key={p}
                        className="h-9 min-w-[36px] rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-medium px-2"
                        aria-current="page"
                      >
                        {p}
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={pageHref(p)}
                        className="h-9 min-w-[36px] rounded-lg border border-zinc-200 flex items-center justify-center text-sm text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 px-2"
                      >
                        {p}
                      </Link>
                    ),
                  )}

                  {serverPage < meta.total_pages ? (
                    <Link
                      href={pageHref(serverPage + 1)}
                      className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="h-9 w-9 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-300 cursor-not-allowed">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
