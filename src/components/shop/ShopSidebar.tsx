'use client';

import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterTag, FilterBrand, FilterAttributeTerm } from '@/lib/api/filters';
import { useFormatPrice } from '@/lib/utils/currency';

interface ShopSidebarProps {
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: FilterTag[];
  brands: FilterBrand[];
  colorTerms: FilterAttributeTerm[];
  sizeTerms: FilterAttributeTerm[];
  selectedCategory: string;
  selectedTag?: string;
  selectedBrand?: string;
  priceRange: [number, number];
  activePriceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedColors: string[];
  onColorToggle: (slug: string) => void;
  selectedSizes: string[];
  onSizeToggle: (slug: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  currentSearch?: string;
}

/** Maps common WooCommerce color term slugs to CSS hex values. */
const COLOR_HEX_MAP: Record<string, string> = {
  black:   '#18181b',
  white:   '#ffffff',
  gray:    '#71717a',
  grey:    '#71717a',
  red:     '#ef4444',
  blue:    '#3b82f6',
  green:   '#22c55e',
  pink:    '#ec4899',
  beige:   '#d4a96a',
  yellow:  '#eab308',
  orange:  '#f97316',
  purple:  '#a855f7',
  brown:   '#92400e',
  navy:    '#1e3a5f',
  maroon:  '#7f1d1d',
  gold:    '#f59e0b',
  silver:  '#9ca3af',
  cream:   '#fef3c7',
  olive:   '#65a30d',
  teal:    '#0d9488',
  sky:     '#0ea5e9',
  indigo:  '#6366f1',
  rose:    '#f43f5e',
  fuchsia: '#d946ef',
};

function getColorHex(slug: string): string {
  return COLOR_HEX_MAP[slug.toLowerCase()] ?? '#9ca3af';
}

const SECTION_TITLE = 'text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3';

function buildHref(params: {
  category?: string | null;
  tag?: string | null;
  brand?: string | null;
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.tag) qs.set('tag', params.tag);
  if (params.brand) qs.set('brand', params.brand);
  if (params.search) qs.set('search', params.search);
  const q = qs.toString();
  return `/products${q ? `?${q}` : ''}`;
}

export function ShopSidebar({
  categories,
  tags,
  brands,
  colorTerms,
  sizeTerms,
  selectedCategory,
  selectedTag,
  selectedBrand,
  priceRange,
  activePriceRange,
  onPriceRangeChange,
  selectedColors,
  onColorToggle,
  selectedSizes,
  onSizeToggle,
  onClearAll,
  activeFilterCount,
  currentSearch,
}: ShopSidebarProps) {
  const fmt = useFormatPrice();
  return (
    <aside className="space-y-7">
      {/* Categories */}
      <div>
        <p className={SECTION_TITLE}>Categories</p>
        <ul className="space-y-1.5">
          <li>
            <Link
              href={buildHref({ tag: selectedTag, brand: selectedBrand, search: currentSearch })}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-all duration-150',
                !selectedCategory
                  ? 'font-semibold text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-all duration-150',
                  !selectedCategory ? 'opacity-100' : 'opacity-0',
                )}
              />
              All
            </Link>
          </li>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <li key={cat.id}>
                <Link
                  href={buildHref({ category: cat.slug, tag: selectedTag, brand: selectedBrand, search: currentSearch })}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-all duration-150',
                    isActive ? 'font-semibold text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
                  )}
                >
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-all duration-150',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tags — only rendered when the endpoint is live */}
      {tags.length > 0 && (
        <>
          <hr className="border-zinc-100" />
          <div>
            <p className={SECTION_TITLE}>Tags</p>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={buildHref({ category: selectedCategory, brand: selectedBrand, search: currentSearch })}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-all duration-150',
                    !selectedTag ? 'font-semibold text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
                  )}
                >
                  <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', !selectedTag ? 'opacity-100' : 'opacity-0')} />
                  All
                </Link>
              </li>
              {tags.map(({ name, slug }) => {
                const isActive = selectedTag === slug;
                return (
                  <li key={slug}>
                    <Link
                      href={buildHref({ category: selectedCategory, tag: slug, brand: selectedBrand, search: currentSearch })}
                      className={cn(
                        'flex items-center gap-1.5 text-sm transition-all duration-150',
                        isActive ? 'font-semibold text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
                      )}
                    >
                      <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'opacity-100' : 'opacity-0')} />
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {/* Brands — only rendered when the endpoint is live */}
      {brands.length > 0 && (
        <>
          <hr className="border-zinc-100" />
          <div>
            <p className={SECTION_TITLE}>Brands</p>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href={buildHref({ category: selectedCategory, tag: selectedTag, search: currentSearch })}
                  className={cn(
                    'flex items-center gap-1.5 text-sm transition-all duration-150',
                    !selectedBrand ? 'font-semibold text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
                  )}
                >
                  <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', !selectedBrand ? 'opacity-100' : 'opacity-0')} />
                  All
                </Link>
              </li>
              {brands.map(({ name, slug }) => {
                const isActive = selectedBrand === slug;
                return (
                  <li key={slug}>
                    <Link
                      href={buildHref({ category: selectedCategory, tag: selectedTag, brand: slug, search: currentSearch })}
                      className={cn(
                        'flex items-center gap-1.5 text-sm transition-all duration-150',
                        isActive ? 'font-semibold text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
                      )}
                    >
                      <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'opacity-100' : 'opacity-0')} />
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {/* Price Range */}
      <hr className="border-zinc-100" />
      <div>
        <p className={SECTION_TITLE}>Price Range</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-1 block">Min</label>
            <input
              type="number"
              min={priceRange[0]}
              max={activePriceRange[1]}
              value={activePriceRange[0]}
              onChange={(e) =>
                onPriceRangeChange([
                  Math.max(priceRange[0], Number(e.target.value)),
                  activePriceRange[1],
                ])
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all duration-150"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-1 block">Max</label>
            <input
              type="number"
              min={activePriceRange[0]}
              max={priceRange[1]}
              value={activePriceRange[1]}
              onChange={(e) =>
                onPriceRangeChange([
                  activePriceRange[0],
                  Math.min(priceRange[1], Number(e.target.value)),
                ])
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all duration-150"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          {fmt(activePriceRange[0])} – {fmt(activePriceRange[1])}
        </p>
      </div>

      {/* Colors — only rendered when the endpoint is live */}
      {colorTerms.length > 0 && (
        <>
          <hr className="border-zinc-100" />
          <div>
            <p className={SECTION_TITLE}>Color</p>
            <div className="flex flex-wrap gap-2">
              {colorTerms.map((color) => {
                const hex = getColorHex(color.slug);
                const isActive = selectedColors.includes(color.slug);
                const isWhite = color.slug === 'white';
                return (
                  <button
                    key={color.slug}
                    onClick={() => onColorToggle(color.slug)}
                    title={color.name}
                    aria-label={`${isActive ? 'Remove' : 'Add'} ${color.name} filter`}
                    style={{ backgroundColor: hex }}
                    className={cn(
                      'h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-150',
                      isWhite ? 'border-zinc-300' : '',
                      isActive
                        ? 'border-zinc-900 scale-110'
                        : !isWhite
                        ? 'border-zinc-100 hover:border-zinc-400'
                        : 'hover:border-zinc-400',
                    )}
                  >
                    {isActive && (
                      <span className={cn('text-[10px] font-bold leading-none', isWhite ? 'text-zinc-900' : 'text-white')}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Sizes — only rendered when the endpoint is live */}
      {sizeTerms.length > 0 && (
        <>
          <hr className="border-zinc-100" />
          <div>
            <p className={SECTION_TITLE}>Size</p>
            <div className="flex flex-wrap gap-2">
              {sizeTerms.map((size) => {
                const isActive = selectedSizes.includes(size.slug);
                return (
                  <button
                    key={size.slug}
                    onClick={() => onSizeToggle(size.slug)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400',
                    )}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <hr className="border-zinc-100" />

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={onClearAll}
          className="w-full rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </aside>
  );
}
