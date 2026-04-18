'use client';

import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductCategory } from '@/lib/api/products';

interface ShopSidebarProps {
  categories: ProductCategory[];
  selectedCategory: string;
  priceRange: [number, number];
  activePriceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedColors: string[];
  onColorToggle: (color: string) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  currentSearch?: string;
}

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#18181b' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Gray', hex: '#71717a' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Beige', hex: '#d4a96a' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SECTION_TITLE = 'text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3';

function buildCategoryHref(slug: string | null, currentSearch?: string) {
  const qs = new URLSearchParams();
  if (slug) qs.set('category', slug);
  if (currentSearch) qs.set('search', currentSearch);
  const q = qs.toString();
  return `/products${q ? `?${q}` : ''}`;
}

export function ShopSidebar({
  categories,
  selectedCategory,
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
  return (
    <aside className="space-y-7">
      {/* Categories */}
      <div>
        <p className={SECTION_TITLE}>Categories</p>
        <ul className="space-y-1.5">
          <li>
            <Link
              href={buildCategoryHref(null, currentSearch)}
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
                  href={buildCategoryHref(cat.slug, currentSearch)}
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
      <hr className="border-zinc-100" />

      {/* Price Range */}
      <div>
        <p className={SECTION_TITLE}>Price Range</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-1 block">Min $</label>
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
            <label className="text-xs text-zinc-400 mb-1 block">Max $</label>
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
          ${activePriceRange[0]} – ${activePriceRange[1]}
        </p>
      </div>
      <hr className="border-zinc-100" />

      {/* Colors */}
      <div>
        <p className={SECTION_TITLE}>Color</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => {
            const isActive = selectedColors.includes(color.name);
            const isWhite = color.name === 'White';
            return (
              <button
                key={color.name}
                onClick={() => onColorToggle(color.name)}
                title={color.name}
                aria-label={`${isActive ? 'Remove' : 'Add'} ${color.name} filter`}
                style={{ backgroundColor: color.hex }}
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
                  <span
                    className={cn(
                      'text-[10px] font-bold leading-none',
                      isWhite ? 'text-zinc-900' : 'text-white',
                    )}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <hr className="border-zinc-100" />

      {/* Sizes */}
      <div>
        <p className={SECTION_TITLE}>Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => {
            const isActive = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => onSizeToggle(size)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-400',
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
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
