'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import type { Review } from '@/lib/api/reviews';
import { voteReview } from '@/lib/api/reviews';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ReviewCardProps {
  review: Review;
  onVoteUpdate?: (updated: { helpful_count: number; unhelpful_count: number }) => void;
}

export function ReviewCard({ review, onVoteUpdate }: ReviewCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [voting, setVoting] = useState(false);
  const [localVote, setLocalVote] = useState<'helpful' | 'unhelpful' | null>(null);
  const [counts, setCounts] = useState({
    helpful: review.helpful_count,
    unhelpful: review.unhelpful_count,
  });

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleVote = async (vote: 'helpful' | 'unhelpful') => {
    if (!isAuthenticated) {
      toast.info('Please log in to vote on reviews.');
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const result = await voteReview(review.id, vote);
      setCounts({ helpful: result.helpful_count, unhelpful: result.unhelpful_count });
      setLocalVote(result.user_vote);
      onVoteUpdate?.({ helpful_count: result.helpful_count, unhelpful_count: result.unhelpful_count });
    } catch {
      toast.error('Could not record your vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="space-y-3 border-b border-zinc-100 pb-6 last:border-0 last:pb-0">
      {/* Author row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
          {(review.author_name ?? 'A').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900">
              {review.author_name ?? 'Anonymous'}
            </span>
            {review.is_verified && (
              <span className="flex items-center gap-1 rounded-full bg-[#7BAE7F]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7BAE7F]">
                <BadgeCheck className="h-3 w-3" strokeWidth={2.5} />
                Verified Purchase
              </span>
            )}
            <span className="ml-auto text-xs text-zinc-400">{fmtDate(review.created_at)}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i <= review.rating ? '#f59e0b' : 'none'}
                stroke={i <= review.rating ? '#f59e0b' : '#d1d5db'}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-sm font-semibold text-zinc-800">{review.title}</p>
      )}

      {/* Content */}
      <p className="text-sm leading-relaxed text-zinc-600">{review.content}</p>

      {/* Images */}
      {review.media.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.media.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setLightboxSrc(m.file_url)}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-200 transition hover:opacity-80"
            >
              <Image src={m.file_url} alt="Review image" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Vote buttons */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-zinc-400">Helpful?</span>
        <button
          type="button"
          onClick={() => handleVote('helpful')}
          disabled={voting}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
            localVote === 'helpful'
              ? 'border-[#7BAE7F]/60 bg-[#7BAE7F]/10 text-[#7BAE7F]'
              : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          {counts.helpful}
        </button>
        <button
          type="button"
          onClick={() => handleVote('unhelpful')}
          disabled={voting}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
            localVote === 'unhelpful'
              ? 'border-[#E57373]/60 bg-[#E57373]/10 text-[#E57373]'
              : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          {counts.unhelpful}
        </button>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-h-[80vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxSrc} alt="Review photo" className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
