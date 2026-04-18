'use client';

import { SlidersHorizontal, LayoutGrid, LayoutList, SquareStack } from 'lucide-react';
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
      ? 'No products found'
      : `Showing ${start}–${end} of ${total} product${total !== 1 ? 's' : ''}`;

  return (
    <div className="flex items-center justify-between gap-4 mb-6 py-3 border-b border-zinc-100">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile filter toggle */}
        <button
          onClick={onMobileFiltersToggle}
          className="lg:hidden flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-all duration-150"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <p className="text-sm text-zinc-500">{resultText}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all duration-150"
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="latest">Newest First</option>
        </select>

        {/* View toggle — desktop only */}
        <div className="hidden sm:flex gap-1">
          {(
            [
              { cols: 2, Icon: LayoutList, label: '2 columns' },
              { cols: 3, Icon: LayoutGrid, label: '3 columns' },
              { cols: 4, Icon: SquareStack, label: '4 columns' },
            ] as const
          ).map(({ cols, Icon, label }) => (
            <button
              key={cols}
              onClick={() => onViewColsChange(cols)}
              aria-label={label}
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-all duration-150',
                viewCols === cols
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-400 hover:text-zinc-600',
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
