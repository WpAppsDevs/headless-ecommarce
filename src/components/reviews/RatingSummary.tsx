'use client';

import { Star } from 'lucide-react';
import type { RatingAggregate } from '@/lib/api/reviews';

interface RatingSummaryProps {
  aggregate: RatingAggregate;
}

export function RatingSummary({ aggregate }: RatingSummaryProps) {
  const { total_reviews, average_rating } = aggregate;
  const stars = [5, 4, 3, 2, 1] as const;

  const countFor = (s: number) =>
    aggregate[`rating_${s}` as keyof RatingAggregate] as number;

  return (
    <div className="flex items-center gap-6">
      {/* Average */}
      <div className="shrink-0 text-center">
        <div className="text-5xl font-bold text-zinc-900">
          {average_rating.toFixed(1)}
        </div>
        <div className="mt-1 flex items-center justify-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="h-4 w-4"
              fill={i <= Math.round(average_rating) ? '#f59e0b' : 'none'}
              stroke={i <= Math.round(average_rating) ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          {total_reviews} {total_reviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Star bars */}
      <div className="flex-1 space-y-1.5">
        {stars.map((s) => {
          const count = countFor(s);
          const pct = total_reviews > 0 ? Math.round((count / total_reviews) * 100) : 0;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className="w-4 text-xs text-zinc-500">{s}</span>
              <Star className="h-3 w-3 text-amber-400" fill="#fbbf24" stroke="#fbbf24" />
              <div className="h-1.5 flex-1 rounded-full bg-zinc-100">
                <div
                  className="h-1.5 rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-xs text-zinc-400">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
