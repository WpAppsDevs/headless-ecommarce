import { tokenCache } from './client';
import { ApiError } from '@/lib/errors';
import { config } from '@/lib/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewMedia {
  id: number;
  file_url: string;
  file_type: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  helpful_count: number;
  unhelpful_count: number;
  created_at: string;
  media: ReviewMedia[];
  author_name?: string;
  author_avatar?: string;
}

export interface ReviewInput {
  product_id: number;
  rating: number;
  title?: string;
  content: string;
}

export interface ReviewsMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ReviewsResult {
  reviews: Review[];
  meta: ReviewsMeta;
}

export interface RatingAggregate {
  product_id: number;
  total_reviews: number;
  average_rating: number;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
}

export interface VoteResult {
  review_id: number;
  helpful_count: number;
  unhelpful_count: number;
  user_vote: 'helpful' | 'unhelpful' | null;
}

export interface MediaUploadResult {
  id: number;
  review_id: number;
  file_url: string;
  file_type: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeader(): Record<string, string> {
  const token = tokenCache.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }
  return (json?.data ?? json) as T;
}

// ---------------------------------------------------------------------------
// Public read functions — isClient pattern: proxy in browser, direct on server
// ---------------------------------------------------------------------------

export async function getProductReviews(
  productId: number,
  page = 1,
  perPage = 10,
  orderby: 'created_at' | 'helpful_count' = 'created_at',
): Promise<ReviewsResult> {
  const isClient = typeof window !== 'undefined';
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    orderby,
  });
  const url = isClient
    ? `/api/reviews/product/${productId}?${qs}`
    : `${config.apiBase}/${config.productsNs}/reviews/product/${productId}?${qs}`;

  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.code ?? 'api_error', json?.message ?? `HTTP ${res.status}`);
  }
  const d = json?.data ?? json;
  return {
    reviews: d.reviews ?? [],
    meta: d.meta ?? { total: 0, page, per_page: perPage, total_pages: 0 },
  };
}

export async function getRatingAggregate(productId: number): Promise<RatingAggregate | null> {
  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/reviews/aggregate/${productId}`
    : `${config.apiBase}/${config.productsNs}/reviews/aggregate/${productId}`;

  const fetchOpts: RequestInit = isClient ? { cache: 'no-store' } : { next: { revalidate: 300 } };

  try {
    const res = await fetch(url, fetchOpts);
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as RatingAggregate | null;
  } catch {
    return null;
  }
}

export async function getRandomReviews(limit = 5): Promise<Review[]> {
  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/reviews/random?limit=${limit}`
    : `${config.apiBase}/${config.productsNs}/reviews/random?limit=${limit}`;

  const fetchOpts: RequestInit = isClient ? { cache: 'no-store' } : { next: { revalidate: 600 } };

  try {
    const res = await fetch(url, fetchOpts);
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data ?? []) as Review[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Authenticated mutations — always use proxy routes (browser only)
// ---------------------------------------------------------------------------

export async function submitReview(data: ReviewInput): Promise<Review> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<Review>(res);
}

export async function uploadReviewMedia(
  reviewId: number,
  files: File[],
): Promise<MediaUploadResult[]> {
  const form = new FormData();
  for (const file of files) {
    form.append('media[]', file);
  }
  // Do NOT set Content-Type — browser sets it with the multipart boundary
  const res = await fetch(`/api/reviews/${reviewId}/media`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
  return handleResponse<MediaUploadResult[]>(res);
}

export async function voteReview(
  reviewId: number,
  vote: 'helpful' | 'unhelpful',
): Promise<VoteResult> {
  const res = await fetch(`/api/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ vote }),
  });
  return handleResponse<VoteResult>(res);
}

export async function deleteReview(reviewId: number): Promise<void> {
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  await handleResponse<{ deleted: boolean }>(res);
}
