'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import type { Review } from '@/lib/api/reviews';

interface TestimonialCarouselProps {
  reviews: Review[];
}

export function TestimonialCarousel({ reviews }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = reviews.length;

  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  // Auto-advance every 5 seconds unless the user is interacting
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, total]);

  if (reviews.length === 0) return null;

  const review = reviews[current];

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card */}
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-100">
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="h-4 w-4"
              fill={i <= review.rating ? '#f59e0b' : 'none'}
              stroke={i <= review.rating ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          ))}
        </div>

        {/* Title */}
        {review.title && (
          <p className="mt-3 text-base font-semibold text-zinc-900">{review.title}</p>
        )}

        {/* Content */}
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 line-clamp-5">
          {review.content}
        </p>

        {/* Author */}
        <div className="mt-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
            {(review.author.name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-800">
              {review.author.name ?? 'Verified Customer'}
            </p>
            {review.author.is_verified && (
              <p className="flex items-center gap-1 text-xs text-[#7BAE7F]">
                <BadgeCheck className="h-3 w-3" strokeWidth={2.5} />
                Verified Purchase
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-zinc-100 transition hover:bg-zinc-50"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-500" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-zinc-100 transition hover:bg-zinc-50"
            aria-label="Next review"
          >
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          </button>

          {/* Dots */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-5 bg-zinc-800' : 'w-1.5 bg-zinc-300'
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
