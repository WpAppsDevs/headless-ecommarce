'use client';

import { SlidersHorizontal, LayoutGrid, List, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'latest';

interface ShopTopBarProps {
  total: number;
  page: number;
  perPage: number;
  sortOrder: SortOrder;
  onSortChange: (s: SortOrder) => void;
  viewCols: 2 | 3 | 4;
  onViewColsChange: (c: 2 | 3 | 4) => void;
  mobileFiltersOpen: boolean;
  onMobileFiltersToggle: () => void;
  activeFilterCount?: number;
}

export function ShopTopBar({
  total,
  page,
  perPage,
  sortOrder,
  onSortChange,
  viewCols,
  onViewColsChange,
  onMobileFiltersToggle,
  activeFilterCount = 0,
}: ShopTopBarProps) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const resultText =
    total === 0
      ? '0 products'
      : `Showing ${start}–${end} of ${total} product${total !== 1 ? 's' : ''}`;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-brand-border">
      {/* Left side: result count + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileFiltersToggle}
          className={cn(
            'lg:hidden flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 focus-brand',
            hasActiveFilters
              ? 'border-brand-wine text-brand-wine bg-brand-accent-light/50'
              : 'border-brand-border text-brand-text hover:bg-brand-card',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex flex-col">
          <p className="text-sm font-medium text-brand-text">{resultText}</p>
          {hasActiveFilters && (
            <p className="text-xs text-brand-wine mt-0.5">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
            </p>
          )}
        </div>
      </div>

      {/* Right side: sort + view toggle */}
      <div className="flex items-center gap-3">
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="min-h-11 rounded-lg border border-brand-border bg-brand-section px-3 py-2 text-sm text-brand-text cursor-pointer transition-all duration-150 focus-brand focus:border-brand-accent-strong"
        >
          <option value="default">Default sorting</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="latest">Newest first</option>
        </select>

        <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg border border-brand-border bg-brand-section">
          {(
            [
              { cols: 2, Icon: List, label: '2 columns' },
              { cols: 3, Icon: LayoutGrid, label: '3 columns' },
              { cols: 4, Icon: Grid3X3, label: '4 columns' },
            ] as const
          ).map(({ cols, Icon, label }) => (
            <button
              key={cols}
              onClick={() => onViewColsChange(cols)}
              aria-label={label}
              aria-pressed={viewCols === cols}
              className={cn(
                'h-8 w-8 rounded-md flex items-center justify-center transition-all duration-150 focus-brand',
                viewCols === cols
                  ? 'bg-brand-wine text-white'
                  : 'text-brand-text-muted hover:text-brand-text',
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
