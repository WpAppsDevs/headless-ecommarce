'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
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

function FilterSection({
  title,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 text-left hover:bg-zinc-50/50 rounded-lg px-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-zinc-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[600px] pb-4' : 'max-h-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ActiveFilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-brand-accent-light px-2.5 py-1 text-xs font-medium text-brand-wine hover:bg-brand-accent/20 transition-colors"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
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
    <div className="space-y-1">
      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-brand-card border border-brand-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Active Filters
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-brand-wine hover:text-brand-accent-hover font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategory && (
              <ActiveFilterPill
                label={`Category: ${selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`}
                onRemove={() => {
                  window.location.href = buildHref({
                    category: null,
                    tag: selectedTag,
                    brand: selectedBrand,
                    search: currentSearch,
                  });
                }}
              />
            )}
            {selectedTag && (
              <ActiveFilterPill
                label={`Tag: ${selectedTag}`}
                onRemove={() => {
                  window.location.href = buildHref({
                    category: selectedCategory,
                    tag: null,
                    brand: selectedBrand,
                    search: currentSearch,
                  });
                }}
              />
            )}
            {selectedBrand && (
              <ActiveFilterPill
                label={`Brand: ${selectedBrand}`}
                onRemove={() => {
                  window.location.href = buildHref({
                    category: selectedCategory,
                    tag: selectedTag,
                    brand: null,
                    search: currentSearch,
                  });
                }}
              />
            )}
            {selectedColors.map((color) => (
              <ActiveFilterPill
                key={color}
                label={`Color: ${color}`}
                onRemove={() => onColorToggle(color)}
              />
            ))}
            {selectedSizes.map((size) => (
              <ActiveFilterPill
                key={size}
                label={`Size: ${size}`}
                onRemove={() => onSizeToggle(size)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <FilterSection
        title="Categories"
        defaultOpen={true}
        badge={selectedCategory ? (
          <span className="h-2 w-2 rounded-full bg-brand-wine" />
        ) : null}
      >
        <ul className="space-y-0.5">
          <li>
            <Link
              href={buildHref({ tag: selectedTag, brand: selectedBrand, search: currentSearch })}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-150',
                !selectedCategory
                  ? 'bg-brand-accent-light font-semibold text-brand-wine'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50',
              )}
            >
              {!selectedCategory && <ChevronRight className="h-3 w-3" />}
              <span className={!selectedCategory ? 'ml-1' : 'ml-5'}>All Products</span>
            </Link>
          </li>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <li key={cat.id}>
                <Link
                  href={buildHref({ category: cat.slug, tag: selectedTag, brand: selectedBrand, search: currentSearch })}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-brand-accent-light font-semibold text-brand-wine'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50',
                  )}
                >
                  {isActive && <ChevronRight className="h-3 w-3" />}
                  <span className={isActive ? 'ml-1' : 'ml-5'}>{cat.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {/* Tags */}
      {tags.length > 0 && (
        <FilterSection
          title="Tags"
          defaultOpen={false}
          badge={selectedTag ? (
            <span className="h-2 w-2 rounded-full bg-brand-wine" />
          ) : null}
        >
          <div className="flex flex-wrap gap-1.5 px-2">
            {tags.map(({ name, slug }) => {
              const isActive = selectedTag === slug;
              return (
                <Link
                  key={slug}
                  href={buildHref({ category: selectedCategory, tag: isActive ? null : slug, brand: selectedBrand, search: currentSearch })}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-wine text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                  )}
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection
          title="Brands"
          defaultOpen={false}
          badge={selectedBrand ? (
            <span className="h-2 w-2 rounded-full bg-brand-wine" />
          ) : null}
        >
          <ul className="space-y-0.5 px-2">
            {brands.map(({ name, slug }) => {
              const isActive = selectedBrand === slug;
              return (
                <li key={slug}>
                  <Link
                    href={buildHref({ category: selectedCategory, tag: selectedTag, brand: isActive ? null : slug, search: currentSearch })}
                    className={cn(
                      'flex items-center gap-2 py-1.5 text-sm transition-all duration-150',
                      isActive
                        ? 'font-semibold text-brand-wine'
                        : 'text-zinc-600 hover:text-zinc-900',
                    )}
                  >
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      isActive ? 'bg-brand-wine' : 'bg-zinc-300',
                    )} />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        defaultOpen={false}
        badge={activePriceRange && (activePriceRange[0] !== priceRange[0] || activePriceRange[1] !== priceRange[1]) ? (
          <span className="h-2 w-2 rounded-full bg-brand-wine" />
        ) : null}
      >
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-zinc-400 mb-1 block">Min Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  {fmt(0).replace(/[0-9.,\s]/g, '')}
                </span>
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
                  className="w-full rounded-lg border border-zinc-200 pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine transition-all"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-400 mb-1 block">Max Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  {fmt(0).replace(/[0-9.,\s]/g, '')}
                </span>
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
                  className="w-full rounded-lg border border-zinc-200 pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{fmt(activePriceRange[0])}</span>
            <span>—</span>
            <span>{fmt(activePriceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      {/* Colors */}
      {colorTerms.length > 0 && (
        <FilterSection
          title="Colors"
          defaultOpen={false}
          badge={selectedColors.length > 0 ? (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
              {selectedColors.length}
            </span>
          ) : null}
        >
          <div className="flex flex-wrap gap-2 px-2">
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
                  className={cn(
                    'h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-150',
                    isWhite ? 'border-zinc-300' : 'border-transparent',
                    isActive
                      ? 'border-brand-wine ring-2 ring-brand-wine/20 scale-110'
                      : !isWhite
                      ? 'border-zinc-100 hover:border-zinc-400'
                      : 'hover:border-zinc-400',
                  )}
                  style={{ backgroundColor: hex }}
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
        </FilterSection>
      )}

      {/* Sizes */}
      {sizeTerms.length > 0 && (
        <FilterSection
          title="Sizes"
          defaultOpen={false}
          badge={selectedSizes.length > 0 ? (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
              {selectedSizes.length}
            </span>
          ) : null}
        >
          <div className="flex flex-wrap gap-2 px-2">
            {sizeTerms.map((size) => {
              const isActive = selectedSizes.includes(size.slug);
              return (
                <button
                  key={size.slug}
                  onClick={() => onSizeToggle(size.slug)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-wine text-white border-brand-wine'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900',
                  )}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );
}
