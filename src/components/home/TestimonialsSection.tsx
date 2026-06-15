'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getRandomReviews } from '@/lib/api/reviews';
import type { Review } from '@/lib/api/reviews';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i <= rating ? '#d4a853' : 'none'}
          stroke={i <= rating ? '#d4a853' : '#78716c'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Awaited<ReturnType<typeof getRandomReviews>>[0] }) {
  const hasImage = review.media && review.media.length > 0;
  const hasText = review.content && review.content.trim().length > 0;
  const avatarUrl = review.author?.avatar_url;
  const authorName = review.author?.name ?? 'Customer';
  const initials = authorName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-section p-6 shadow-sm">
      {/* Stars */}
      <Stars rating={review.rating} />

      {/* Title */}
      {review.title && (
        <p className="text-sm font-semibold text-brand-text">{review.title}</p>
      )}

      {/* Content — text or image */}
      {hasText && (
        <p className="flex-1 text-sm leading-relaxed text-brand-text-muted line-clamp-4">
          {review.content}
        </p>
      )}

      {hasImage && !hasText && (
        <div className="relative flex-1 overflow-hidden rounded-lg bg-brand-border">
          <Image
            src={review.media[0].url}
            alt={`Review by ${authorName}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-brand-border pt-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={authorName}
            width={40}
            height={40}
            className="shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-text">{authorName}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      try {
        const data = await getRandomReviews(4);
        if (mounted) {
          setReviews(data);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError('Unable to load customer reviews.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    void fetchReviews();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="bg-brand-bg py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-block h-6 w-32 animate-pulse rounded-full bg-brand-border" />
            <div className="mx-auto mt-4 h-9 w-64 animate-pulse rounded bg-brand-border" />
            <div className="mx-auto mt-2 h-4 w-80 animate-pulse rounded bg-brand-border" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-section p-6 shadow-sm"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 w-4 animate-pulse rounded bg-brand-border" />
                  ))}
                </div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-brand-border" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-brand-border" />
                  <div className="h-3 w-full animate-pulse rounded bg-brand-border" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-brand-border" />
                </div>
                <div className="mt-auto flex items-center gap-3 border-t border-brand-border pt-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-brand-border" />
                  <div className="h-4 w-24 animate-pulse rounded bg-brand-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || reviews.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="testimonials-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-accent/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Customer Reviews
          </span>
          <h2 id="testimonials-heading" className="mt-4 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-sm text-brand-text-muted">
            Real experiences from our customers across the country.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
