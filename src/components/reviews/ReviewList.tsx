'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewListSkeleton } from './ReviewListSkeleton';
import { ReviewFilters, type ReviewSortOption } from './ReviewFilters';
import { getProductReviews } from '@/lib/api/reviews';
import type { Review, ReviewsMeta } from '@/lib/api/reviews';

interface ReviewListProps {
  productId: number;
}

const PER_PAGE = 5;

export function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ReviewSortOption>('created_at');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number, nextSort: ReviewSortOption) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getProductReviews(productId, nextPage, PER_PAGE, nextSort);
        setReviews(result.reviews);
        setMeta(result.meta);
      } catch {
        setError('Could not load reviews. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    void load(page, sort);
  }, [load, page, sort]);

  const handleSortChange = (newSort: ReviewSortOption) => {
    setSort(newSort);
    setPage(1);
  };

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-5">
      <ReviewFilters sort={sort} onSortChange={handleSortChange} />

      {loading ? (
        <ReviewListSkeleton count={PER_PAGE} />
      ) : reviews.length === 0 ? (
        <p className="py-4 text-sm italic text-zinc-400">
          No reviews yet — be the first to review this product!
        </p>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <span className="text-xs text-zinc-400">
                Page {page} of {meta.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.total_pages}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
