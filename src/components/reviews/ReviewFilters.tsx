'use client';

import { ChevronDown } from 'lucide-react';

export type ReviewSortOption = 'created_at' | 'helpful_count';

interface ReviewFiltersProps {
  sort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
}

export function ReviewFilters({ sort, onSortChange }: ReviewFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-zinc-700">Customer Reviews</p>

      {/* Sort selector */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ReviewSortOption)}
          className="cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pl-3 pr-8 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          aria-label="Sort reviews"
        >
          <option value="created_at">Newest first</option>
          <option value="helpful_count">Most helpful</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}
