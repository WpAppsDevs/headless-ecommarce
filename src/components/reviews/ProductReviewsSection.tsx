'use client';

import { useState } from 'react';
import { PenLine, LogIn } from 'lucide-react';
import { RatingSummary } from './RatingSummary';
import { ReviewList } from './ReviewList';
import { ReviewModal } from '@/components/review-modal/ReviewModal';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';
import type { RatingAggregate } from '@/lib/api/reviews';
import { useRouter } from 'next/navigation';

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
  /** Pre-fetched aggregate from the server component (avoids client fetch for initial render) */
  initialAggregate?: RatingAggregate | null;
}

export function ProductReviewsSection({
  productId,
  productName,
  initialAggregate,
}: ProductReviewsSectionProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isReviewed = useReviewStore((s) => s.isReviewed);
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [aggregate, setAggregate] = useState(initialAggregate ?? null);

  const alreadyReviewed = isReviewed(productId);

  const handleReviewSuccess = () => {
    // Optimistically bump the total — ReviewList re-fetches on next render
    if (aggregate) {
      setAggregate({
        ...aggregate,
        total_reviews: aggregate.total_reviews + 1,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Aggregate summary */}
      {aggregate && aggregate.total_reviews > 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5">
          <RatingSummary aggregate={aggregate} />
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No reviews yet.</p>
      )}

      {/* Write review CTA */}
      <div>
        {isAuthenticated ? (
          alreadyReviewed ? (
            <p className="inline-flex items-center gap-2 rounded-lg bg-[#7BAE7F]/10 px-4 py-2.5 text-sm font-medium text-[#7BAE7F]">
              ✓ You have reviewed this product
            </p>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-wine px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <PenLine className="h-4 w-4" strokeWidth={2} />
              Write a Review
            </button>
          )
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.5} />
            Log in to write a review
          </button>
        )}
      </div>

      {/* Review list */}
      {(aggregate?.total_reviews ?? 0) > 0 && (
        <ReviewList productId={productId} />
      )}

      {/* Review modal */}
      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        items={[{ product_id: productId, name: productName }]}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
