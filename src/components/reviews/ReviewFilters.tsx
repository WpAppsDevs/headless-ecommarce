'use client';

import { ChevronDown } from 'lucide-react';
import { useDictionary } from '@/i18n/LocaleProvider';

export type ReviewSortOption = 'created_at' | 'helpful_count';

interface ReviewFiltersProps {
  sort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
}

export function ReviewFilters({ sort, onSortChange }: ReviewFiltersProps) {
  const copy = useDictionary().reviews;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-zinc-700">{copy.customerReviews}</p>

      {/* Sort selector */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ReviewSortOption)}
          className="cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pl-3 pr-8 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          aria-label={copy.sortAria}
        >
          <option value="created_at">{copy.sortNewest}</option>
          <option value="helpful_count">{copy.sortHelpful}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}
