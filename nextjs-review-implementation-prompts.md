# Next.js Review System — Implementation Prompts

Generated from: `nextjs-review-system-prd.md`
API Reference: `API Documentation.md`

---

## How to Use This File

Each prompt below is **self-contained**. Copy a single prompt to your AI assistant and execute it in order. Each task references the files it touches and the exact patterns to follow from the existing codebase.

**Prerequisites before starting:**
- The existing `src/lib/api/client.ts` (apiClient, tokenCache) is already implemented.
- The existing `src/lib/api/orders.ts` (getOrders, Order types) is already implemented.
- The existing `src/stores/authStore.ts` (useAuthStore) is already implemented.
- Tailwind CSS v4, Zustand v5, React Hook Form, Zod, Sonner, and lucide-react are installed.

---

## Phase 1 — Foundation: Types & API Layer

### Prompt 1.1 — Extend Order Types with `refunds` Field

**Context:**
- File to edit: `src/lib/api/orders.ts`
- The `Order` interface is already defined in that file.
- The `getOrders` API response includes a `refunds` array per order (see `API Documentation.md` §9.1), but the current `Order` type does not model it.

**Task:**
Add the `OrderRefund` interface and the `refunds` field to the `Order` interface in `src/lib/api/orders.ts`.

```typescript
// Add this interface above the Order interface:
export interface OrderRefund {
  id: number;
  reason: string;
  total: string; // always a negative string, e.g. "-10.00"
}

// Add this field to the existing Order interface:
refunds: OrderRefund[];
```

No other changes needed. The `getOrders` function already passes through the full API response, so `refunds` will be populated automatically.

---

### Prompt 1.2 — Create `src/lib/api/reviews.ts`

**Context:**
- Pattern to follow: `src/lib/api/orders.ts` and `src/lib/api/wishlist.ts`
- Use `apiClient<T>()` from `src/lib/api/client.ts` for all authenticated requests.
- Use `config.apiBase`, `config.apiNs`, and `config.productsNs` from `src/lib/config.ts`.
- Error class: `ApiError` from `src/lib/errors.ts`.
- API namespaces (from `API Documentation.md` §2):
  - Public reads: `wpadhlwrapi/v1` → `config.productsNs`
  - Mutations: `api` → `config.apiNs`
- All endpoints are documented in `API Documentation.md` §14.

**Task:**
Create `src/lib/api/reviews.ts` with the following exports:

**Types:**
```typescript
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
}

export interface ReviewsMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
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

export interface ReviewInput {
  product_id: number;
  rating: number;
  title?: string;
  content: string;
}

export interface VoteResult {
  review_id: number;
  helpful_count: number;
  unhelpful_count: number;
  user_vote: 'helpful' | 'unhelpful' | null;
}
```

**Functions:**

1. `getProductReviews(productId, page?, perPage?, orderby?)` — `GET /wp-json/wpadhlwrapi/v1/reviews/product/{productId}`
   - Returns `{ reviews: Review[], meta: ReviewsMeta }`
   - Uses plain `fetch` (no auth required)
   - Use `{ next: { revalidate: 300 } }` for ISR caching (5 min, per PRD)

2. `getRatingAggregate(productId)` — `GET /wp-json/wpadhlwrapi/v1/reviews/aggregate/{productId}`
   - Returns `RatingAggregate`
   - Uses plain `fetch`, `{ next: { revalidate: 600 } }` (10 min)

3. `getRandomReviews(limit?)` — `GET /wp-json/wpadhlwrapi/v1/reviews/random?limit={limit}`
   - Returns `Review[]`
   - Uses plain `fetch`, `{ next: { revalidate: 600 } }`

4. `submitReview(data)` — `POST /wp-json/api/reviews`
   - Uses `apiClient<Review>()` with `method: 'POST'`, `body: JSON.stringify(data)`
   - Endpoint path: proxy through `/api/reviews` (browser) — see Prompt 1.3

5. `uploadReviewMedia(reviewId, files)` — `POST /wp-json/api/reviews/{reviewId}/media`
   - Accepts `reviewId: number` and `files: File[]`
   - Builds a `FormData` with `media[]` entries
   - Uses plain `fetch` with `Authorization: Bearer <token>` from `tokenCache.get()`
   - Returns `ReviewMedia[]`
   - Do NOT set `Content-Type` header — let the browser set it with the boundary

6. `voteReview(reviewId, vote)` — `POST /wp-json/api/reviews/{reviewId}/vote`
   - Uses `apiClient<VoteResult>()`

7. `deleteReview(reviewId)` — `DELETE /wp-json/api/reviews/{reviewId}`
   - Uses `apiClient<{ deleted: boolean }>()`

---

### Prompt 1.3 — Create Next.js Route Handler: `POST /api/reviews`

**Context:**
- Pattern to follow: `src/app/api/account/orders/route.ts`
- All browser-side API calls proxy through `/api/*` Next.js route handlers to avoid CORS.
- The WP API endpoint is `POST ${config.apiBase}/${config.apiNs}/reviews`.
- Auth: forward the `Authorization: Bearer` header from the incoming request.

**Task:**
Create `src/app/api/reviews/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (!auth) {
    return NextResponse.json({ success: false, code: 'missing_token', message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.text();
  const upstream = await fetch(
    `${config.apiBase}/${config.apiNs}/reviews`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body,
    },
  );

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

---

### Prompt 1.4 — Create Next.js Route Handler: `POST /api/reviews/[review_id]/media`

**Context:**
- Media upload uses `multipart/form-data`, not JSON.
- The WP API endpoint is `POST ${config.apiBase}/${config.apiNs}/reviews/{review_id}/media`.
- Do NOT set a `Content-Type` header — forward the multipart stream with its boundary intact.

**Task:**
Create `src/app/api/reviews/[review_id]/media/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ review_id: string }> }
) {
  const { review_id } = await params;
  const auth = req.headers.get('Authorization');
  if (!auth) {
    return NextResponse.json({ success: false, code: 'missing_token' }, { status: 401 });
  }

  const formData = await req.formData();
  const upstream = await fetch(
    `${config.apiBase}/${config.apiNs}/reviews/${review_id}/media`,
    {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
    },
  );

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

---

## Phase 2 — State Management

### Prompt 2.1 — Create `src/stores/reviewStore.ts`

**Context:**
- Pattern to follow: `src/stores/wishlistStore.ts`
- Uses Zustand v5 with `create<State>()`
- Purpose: track which `product_id`s the current user has already reviewed **in this session**, so the UI can replace "Write Review" with "Reviewed ✓" immediately after submission without refetching orders.

**Task:**
Create `src/stores/reviewStore.ts`:

```typescript
import { create } from 'zustand';

interface ReviewStoreState {
  /** Set of product IDs reviewed in the current session */
  reviewedProductIds: Set<number>;
  /** Mark a product as reviewed (called after successful POST /api/reviews) */
  markReviewed: (productId: number) => void;
  /** Check if a product has been reviewed in this session */
  isReviewed: (productId: number) => boolean;
  /** Clear on logout */
  clear: () => void;
}

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  reviewedProductIds: new Set(),

  markReviewed: (productId) =>
    set((s) => ({ reviewedProductIds: new Set([...s.reviewedProductIds, productId]) })),

  isReviewed: (productId) => get().reviewedProductIds.has(productId),

  clear: () => set({ reviewedProductIds: new Set() }),
}));
```

Also update `src/stores/authStore.ts` — in the `logout` action, call `useReviewStore.getState().clear()` (import at top, after the existing store imports).

---

## Phase 3 — Review Form Components

### Prompt 3.1 — Create `src/components/reviews/StarRatingInput.tsx`

**Context:**
- 'use client' component.
- Used inside the review form (controlled, not uncontrolled).
- Style: 5 clickable star icons. Selected stars are filled (`text-amber-400`), unselected are outline (`text-zinc-300`).
- On hover, preview the hovered rating before clicking.
- Use `lucide-react` `Star` icon.

**Task:**
Create `src/components/reviews/StarRatingInput.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;           // 0 means unset
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const displayed = hovered || value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none disabled:cursor-not-allowed"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= displayed
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-zinc-300'
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
```

---

### Prompt 3.2 — Create `src/components/reviews/ReviewImageUpload.tsx`

**Context:**
- 'use client' component.
- Accepts up to 5 images (JPEG, PNG, GIF, WebP), max 5 MB each.
- Shows thumbnail previews with a remove button for each selected image.
- Validation errors shown inline.
- Uses a hidden `<input type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp">`.
- Style: matches existing card/border patterns (`rounded-xl border border-zinc-200`).
- Use `lucide-react` icons: `ImagePlus`, `X`.

**Task:**
Create `src/components/reviews/ReviewImageUpload.tsx`:

Props:
```typescript
interface ReviewImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}
```

Logic:
- `MAX_FILES = 5`, `MAX_SIZE_MB = 5`
- On file select: validate count (existing + new ≤ 5) and size per file (≤ 5 MB). Show inline error string if invalid.
- Generate object URLs for thumbnails using `URL.createObjectURL`. Revoke on remove.
- The remove button calls `onChange(files.filter((_, i) => i !== idx))`.

UI layout:
- Wrap the file input trigger and thumbnails in a `div className="flex flex-wrap gap-2"`.
- Each thumbnail: `relative h-20 w-20 rounded-xl overflow-hidden ring-1 ring-zinc-200`.
- "Add image" trigger (when count < 5): `h-20 w-20 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-brand-wine hover:text-brand-wine transition cursor-pointer`.

---

### Prompt 3.3 — Create `src/components/reviews/ReviewForm.tsx`

**Context:**
- 'use client' component.
- Uses `react-hook-form` + `zod` for validation (same pattern as checkout forms in the codebase).
- Uses `StarRatingInput` (Prompt 3.1) and `ReviewImageUpload` (Prompt 3.2).
- Calls `submitReview` and `uploadReviewMedia` from `src/lib/api/reviews.ts`.
- On success: calls `useReviewStore.getState().markReviewed(productId)` and fires `onSuccess` callback.
- Uses `sonner` `toast` for success/error feedback: `import { toast } from 'sonner'`.
- Error code mapping (from `API Documentation.md` §14.4):
  - `already_reviewed` → "You've already reviewed this product."
  - `duplicate_review` → "This review content was already submitted recently."
  - `rate_limited` → "You've reached the daily review limit. Please try again tomorrow."
  - `invalid_product` → "This product is no longer available for review."
  - All others → display `error.message`

**Zod schema:**
```typescript
const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().optional(),
  content: z.string().min(1, 'Review content is required').max(2000),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;
```

**Props:**
```typescript
interface ReviewFormProps {
  productId: number;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Submission flow (two-step):**
1. `const review = await submitReview({ product_id: productId, rating, title, content })`
2. If `files.length > 0`: `await uploadReviewMedia(review.id, files)` — on failure, show a warning toast but still call `onSuccess` (review was already saved).

**Loading state:** Disable all form fields and show a `Loader2` spinner inside the submit button while submitting.

**Submit button:** `bg-brand-wine` style. Label: "Submit Review" (idle) / "Submitting…" (loading).
**Cancel button:** `border border-zinc-200 text-zinc-600 hover:bg-zinc-50` style.

---

## Phase 4 — Review Modal (Orders Page Entry Point)

### Prompt 4.1 — Create `src/components/review-modal/ReviewModal.tsx`

**Context:**
- 'use client' component.
- Follows the **exact same modal pattern** as `src/components/account/OrderDetailsModal.tsx`:
  - Backdrop: `fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8`
  - Click backdrop to close
  - Close button: `rounded-full bg-white/15 p-1.5 text-white` with `X` icon
- Contains `ReviewForm` (Prompt 3.3) with the product's pre-filled context shown in the header.

**Props:**
```typescript
interface ReviewModalProps {
  productId: number;
  productName: string;
  productImage: string;  // may be "" — use placeholder
  orderId: number;
  orderDate: string | null;
  onClose: () => void;
}
```

**UI structure:**
```
[Backdrop]
  └─ [max-w-lg centered container]
       ├─ [Title bar row]: "Write a Review" heading + X close button
       └─ [White rounded card]
            ├─ [Product context row]:
            │    ├─ Product image thumbnail (60×60, rounded-xl, bg-zinc-100 placeholder if no image)
            │    ├─ Product name (font-semibold text-zinc-900)
            │    └─ "Ordered on {date} · Order #{id}" (text-[12px] text-zinc-400)
            ├─ [Divider]
            └─ [ReviewForm productId onSuccess=onClose onCancel=onClose]
```

Use `next/image` for the product image with `width={60} height={60}` and `className="rounded-xl object-cover"`. If `productImage` is empty, render a `div className="h-[60px] w-[60px] shrink-0 rounded-xl bg-zinc-100"` placeholder instead.

---

## Phase 5 — Orders List Integration

### Prompt 5.1 — Create `src/components/orders/OrderItemReviewAction.tsx`

**Context:**
- 'use client' component.
- This is the smart eligibility-checking wrapper rendered per `line_item` inside `OrderCard`.
- Eligibility logic (from PRD §"Review Eligibility Criteria"):
  1. Order status must be `'completed'` or `'processing'`
  2. Order must not be fully refunded: `∑ Math.abs(parseFloat(refund.total)) < parseFloat(order.total)`
  3. Product must not already be reviewed (check `useReviewStore.getState().isReviewed(productId)`)
- Uses `useReviewStore` from `src/stores/reviewStore.ts`.
- Renders `<WriteReviewButton>` if eligible, "Reviewed ✓" badge if already reviewed, or `null` otherwise.

**Props:**
```typescript
interface OrderItemReviewActionProps {
  order: Order;          // full Order object (needs status, total, refunds)
  productId: number;
  productName: string;
  productImage: string;
}
```

**Eligibility computation (pure helper — export for testing):**
```typescript
export function isReviewEligible(order: Order): boolean {
  const ELIGIBLE_STATUSES = ['completed', 'processing'];
  if (!ELIGIBLE_STATUSES.includes(order.status)) return false;

  const totalRefunded = (order.refunds ?? []).reduce(
    (sum, r) => sum + Math.abs(parseFloat(r.total)),
    0,
  );
  if (totalRefunded >= parseFloat(order.total)) return false;

  return true;
}
```

**State:** Use a local `useState<boolean>` for `isModalOpen`.

**Render logic:**
```
isReviewEligible(order) === false  →  return null
isReviewed(productId)  === true    →  render "Reviewed ✓" badge
otherwise                          →  render <WriteReviewButton onClick={() => setIsModalOpen(true)} />
                                       + <ReviewModal ... open={isModalOpen} onClose={...} />
```

**"Reviewed ✓" badge style:**
```
rounded-md border border-[#7BAE7F]/50 px-3 py-1.5 text-[11px] font-semibold text-[#7BAE7F] bg-[#7BAE7F]/10
```

---

### Prompt 5.2 — Create `src/components/orders/WriteReviewButton.tsx`

**Context:**
- 'use client' component.
- A simple presentational button — eligibility and modal state are managed by `OrderItemReviewAction`.
- Uses `lucide-react` `PenLine` icon.
- Style must match the existing "Cancel Order" button in `OrderCard.tsx`:
  ```
  rounded-lg border border-[color] px-4 py-2 text-[12px] font-semibold transition hover:bg-[color]/5
  ```
- Use brand color `brand-wine` for border and text.

**Task:**
Create `src/components/orders/WriteReviewButton.tsx`:

```typescript
'use client';

import { PenLine } from 'lucide-react';

interface WriteReviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function WriteReviewButton({ onClick, disabled }: WriteReviewButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg border border-brand-wine/60 px-4 py-2 text-[12px] font-semibold text-brand-wine transition hover:bg-brand-wine/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
      Write Review
    </button>
  );
}
```

---

### Prompt 5.3 — Update `src/components/account/OrderCard.tsx`

**Context:**
- File to edit: `src/components/account/OrderCard.tsx`
- The `Order` type is already imported from `src/lib/api/orders`.
- Currently the action row (Row 4) has "Cancel Order" and "View Details" buttons.
- The "Write Review" button must appear **beside** (before) the "Cancel Order" button.
- The button is rendered **per line item** (not per order), so we need to iterate over `order.line_items`.
- Import `OrderItemReviewAction` from `src/components/orders/OrderItemReviewAction`.

**Task:**
Update `src/components/account/OrderCard.tsx`:

1. Add an import:
   ```typescript
   import { OrderItemReviewAction } from '@/components/orders/OrderItemReviewAction';
   ```

2. In the JSX, add a new **"Row 3.5 — Line items review actions"** section between the products row and the status/action row. Deduplicate `line_items` by `product_id` before rendering:

   ```tsx
   {/* Row 3.5 — Per-product review actions */}
   {(() => {
     const seen = new Set<number>();
     const uniqueItems = order.line_items.filter(item => {
       if (seen.has(item.product_id)) return false;
       seen.add(item.product_id);
       return true;
     });
     return uniqueItems.map(item => (
       <OrderItemReviewAction
         key={item.product_id}
         order={order}
         productId={item.product_id}
         productName={item.name}
         productImage={item.image}
       />
     ));
   })()}
   ```

   Wrap the above in a container only if there are eligible items (to avoid extra spacing for ineligible orders). Suggested wrapper when items exist: `<div className="flex flex-wrap gap-2 px-6 pb-3" />`.

   **Note:** The eligibility check inside `OrderItemReviewAction` handles whether each button is visible — no need to pre-filter here.

---

## Phase 6 — Product Page Review Display

### Prompt 6.1 — Create `src/components/reviews/ReviewCard.tsx`

**Context:**
- 'use client' component (for voting interaction).
- Displays a single `Review` object.
- Shows: star rating (using a read-only star row — 5 stars, filled to `review.rating`), `is_verified` badge, reviewer display (use `user_id` — no username is returned by the API, display "Verified Buyer" when `is_verified`, else "Customer"), `created_at` date, `title`, `content`, media thumbnails (if any), helpful/unhelpful vote buttons.
- Vote button calls `voteReview(review.id, vote)` from `src/lib/api/reviews.ts`.
- Update local state optimistically on vote.

**Props:**
```typescript
interface ReviewCardProps {
  review: Review;
}
```

**Verified badge style:** `bg-[#7BAE7F]/10 text-[#7BAE7F] border border-[#7BAE7F]/30 text-[10px] px-2 py-0.5 rounded-md font-semibold`

**Read-only stars:** Render 5 `Star` icons from `lucide-react`. `fill-amber-400` for ≤ `review.rating`, else `fill-transparent text-zinc-200`.

**Vote buttons:** `ThumbsUp` / `ThumbsDown` icons from `lucide-react`. Count displayed beside icon. Highlight the button matching `user_vote` if known.

**Media thumbnails:** If `review.media.length > 0`, render a horizontal scroll row of `<img>` thumbnails (48×48, `rounded-lg object-cover ring-1 ring-zinc-200`). Clicking opens a full-size view (simple `window.open(url, '_blank')`).

---

### Prompt 6.2 — Create `src/components/reviews/ReviewList.tsx`

**Context:**
- 'use client' component.
- Fetches `getProductReviews(productId, page, perPage, orderby)` from `src/lib/api/reviews.ts`.
- Manages pagination state internally.
- Shows skeleton loaders (`src/components/ui/skeleton.tsx` already exists) while loading.
- Shows empty state: "No reviews yet. Be the first to review this product."
- `orderby` toggle: "Most Recent" (created_at) | "Most Helpful" (helpful_count).

**Props:**
```typescript
interface ReviewListProps {
  productId: number;
  initialPage?: number;
}
```

**UI structure:**
```
[Sort bar: "Most Recent" | "Most Helpful" toggle buttons]
[ReviewCard × per_page]
[Pagination: prev / numbered pages / next — same pattern as Orders.tsx]
```

---

### Prompt 6.3 — Create `src/components/reviews/RatingSummary.tsx`

**Context:**
- Server Component compatible (no 'use client' needed — purely display).
- Receives `RatingAggregate` data as a prop (fetched server-side on the product page).
- Displays: average rating (large, bold), total review count, 5-star bar chart (percentage width per star band).

**Props:**
```typescript
interface RatingSummaryProps {
  aggregate: RatingAggregate;
}
```

**Star bar style:** Each row: star label (e.g. "5 ★") + progress bar (`bg-amber-400 rounded-full h-2`) whose `width` is `${(rating_N / total_reviews) * 100}%`. Wrap the bar in a `bg-zinc-100 rounded-full h-2 flex-1` container.

---

### Prompt 6.4 — Create `src/components/reviews/ReviewFilters.tsx`

**Context:**
- 'use client' component.
- Used on the product page to let users filter reviews by star rating (1–5) or show all.
- Calls `onChange(filterValue)` when a filter is selected; the parent component re-fetches reviews with the filter applied.
- Note: The current `GET /wpadhlwrapi/v1/reviews/product/{id}` endpoint does not support a `rating` filter param — filtering must be done client-side on already-fetched reviews, OR the parent passes `filterValue` to the `orderby` param (best-effort). Document this limitation in a code comment.

**Props:**
```typescript
interface ReviewFiltersProps {
  active: number | null;   // null = all, 1-5 = specific star
  onChange: (filter: number | null) => void;
}
```

Render 6 pill buttons: "All" + "5 ★" through "1 ★".

---

### Prompt 6.5 — Integrate Reviews Section into Product Detail Page

**Context:**
- File to edit: the existing product detail page component (find it with `glob "src/app/**/[slug]*/page.tsx"` or the product page).
- The server component already fetches product data. Add parallel fetches for `getRatingAggregate` and the first page of `getProductReviews`.
- Import: `RatingSummary`, `ReviewList`, `ReviewFilters`, and add a "Write Review" button that opens `ReviewModal` (for PDP-based review submission — the user must be authenticated).
- Place the reviews section below the product details, in a `<section>` with `id="reviews"` for anchor linking.

**Server-side additions (in `page.tsx`):**
```typescript
const [aggregate] = await Promise.allSettled([
  getRatingAggregate(product.id),
]);
const ratingAggregate = aggregate.status === 'fulfilled' ? aggregate.value : null;
```

**Client-side section component (create `src/components/reviews/ProductReviewsSection.tsx`):**
- 'use client'
- Props: `productId: number`, `initialAggregate: RatingAggregate | null`
- Contains `RatingSummary` + `ReviewFilters` + `ReviewList` + a "Write a Review" button
- "Write a Review" button: visible only to authenticated users (`useAuthStore`). Shows `ReviewModal` on click.
- Unauthenticated users see: "Log in to write a review" link instead.

---

## Phase 7 — Homepage Testimonials Widget

### Prompt 7.1 — Create `src/components/home/TestimonialCarousel.tsx`

**Context:**
- Server Component (receives pre-fetched `Review[]` as props — fetched in the homepage Server Component).
- Displays a horizontal row of review cards (or a simple grid on mobile).
- Each card shows: star rating (read-only), `content` (truncated to 120 chars), `is_verified` badge.
- No client-side interactivity needed — pure display.
- Data fetch in the parent (homepage Server Component): `getRandomReviews(5)` with `revalidate: 600`.

**Props:**
```typescript
interface TestimonialCarouselProps {
  reviews: Review[];
}
```

---

## Phase 8 — SEO Integration

### Prompt 8.1 — Add `AggregateRating` JSON-LD to Product Page

**Context:**
- File to edit: the product detail `page.tsx` (Server Component).
- Next.js App Router pattern: add a `<script type="application/ld+json">` tag inside the page's returned JSX, or use `generateMetadata` for metadata.
- Use the `RatingAggregate` data fetched in Prompt 6.5.

**Task:**
In the product page Server Component, render a JSON-LD script if `ratingAggregate` is available and `total_reviews > 0`:

```tsx
{ratingAggregate && ratingAggregate.total_reviews > 0 && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: ratingAggregate.average_rating.toFixed(1),
          reviewCount: ratingAggregate.total_reviews,
          bestRating: '5',
          worstRating: '1',
        },
      }),
    }}
  />
)}
```

---

### Prompt 8.2 — Add `Review` JSON-LD Items to Product Page

**Context:**
- Extends Prompt 8.1.
- Fetch the first page of approved reviews server-side alongside the aggregate.
- Include each review as a `Review` schema item nested inside the `Product` schema.

**Task:**
Update the JSON-LD script to include `review` array (limit to first 5 for payload size):

```typescript
review: reviews.slice(0, 5).map(r => ({
  '@type': 'Review',
  reviewRating: {
    '@type': 'Rating',
    ratingValue: r.rating,
    bestRating: '5',
    worstRating: '1',
  },
  author: { '@type': 'Person', name: r.is_verified ? 'Verified Buyer' : 'Customer' },
  reviewBody: r.content,
  datePublished: r.created_at.split(' ')[0],
})),
```

---

## Phase 9 — Performance Optimizations

### Prompt 9.1 — Add Skeleton Loaders to ReviewList

**Context:**
- `src/components/ui/skeleton.tsx` already exists.
- Add a `ReviewListSkeleton` component that renders 3 placeholder `ReviewCard`-shaped skeletons.
- Use it in `ReviewList.tsx` (Prompt 6.2) while `loading === true`.

**Task:**
Create `src/components/reviews/ReviewListSkeleton.tsx`:
- Renders 3 skeleton cards, each containing:
  - A row of 5 skeleton circles (stars): `h-5 w-5 rounded-full`
  - A short `h-4 w-32 rounded` skeleton (reviewer label)
  - Two lines of `h-3 rounded` skeleton (content)

---

### Prompt 9.2 — Debounce Review Filter Changes

**Context:**
- File to edit: `src/components/reviews/ReviewFilters.tsx` (Prompt 6.4).
- Filtering triggers a re-fetch. Debounce the `onChange` call by 300 ms to avoid rapid re-fetches if the user clicks through filters quickly.
- Implement a simple `useDebounce` hook in `src/lib/utils/useDebounce.ts` if it does not already exist.

**Task:**
Create `src/lib/utils/useDebounce.ts`:
```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

Update `ReviewFilters` to debounce the `onChange` call using this hook.

---

## Phase 10 — Refactoring & Cleanup

### Prompt 10.1 — Extract Shared `fmtDate` Utility

**Context:**
- `fmtDate` and `fmtDateTime` helpers are currently duplicated in `OrderCard.tsx` and `OrderDetailsModal.tsx`.
- The review modal also needs to format `order.date_created`.
- Extract to `src/lib/utils/date.ts`.

**Task:**
Create `src/lib/utils/date.ts`:
```typescript
export function fmtDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function fmtDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
```

Update `OrderCard.tsx`, `OrderDetailsModal.tsx`, and `ReviewModal.tsx` to import from `src/lib/utils/date.ts` instead of declaring local copies.

---

### Prompt 10.2 — Extract `STATUS_CONFIG` into Shared Constant

**Context:**
- `STATUS_CONFIG` is duplicated in `OrderCard.tsx` and `OrderDetailsModal.tsx`.
- Extract it to `src/lib/utils/orderStatus.ts`.

**Task:**
Create `src/lib/utils/orderStatus.ts` and move the `STATUS_CONFIG` constant there. Update both files to import from this new location.

---

### Prompt 10.3 — Add Error Boundary for Reviews Section

**Context:**
- If the reviews API is unavailable, the entire product page should not crash.
- Add an `ErrorBoundary` wrapper around the `ProductReviewsSection` component.

**Task:**
Create `src/components/reviews/ReviewsErrorBoundary.tsx`:
- A React class-based error boundary (required for `componentDidCatch`).
- Fallback UI: a simple `<div>` with "Reviews are temporarily unavailable." message.
- Wrap `<ProductReviewsSection>` with `<ReviewsErrorBoundary>` in the product page.

---

## Summary: Implementation Order

| Phase | Task | Files Created / Modified |
|---|---|---|
| 1 | 1.1 Extend Order types | `src/lib/api/orders.ts` (edit) |
| 1 | 1.2 Create reviews API layer | `src/lib/api/reviews.ts` (new) |
| 1 | 1.3 Route handler: POST /api/reviews | `src/app/api/reviews/route.ts` (new) |
| 1 | 1.4 Route handler: POST /api/reviews/[id]/media | `src/app/api/reviews/[review_id]/media/route.ts` (new) |
| 2 | 2.1 Review Zustand store | `src/stores/reviewStore.ts` (new), `authStore.ts` (edit) |
| 3 | 3.1 StarRatingInput | `src/components/reviews/StarRatingInput.tsx` (new) |
| 3 | 3.2 ReviewImageUpload | `src/components/reviews/ReviewImageUpload.tsx` (new) |
| 3 | 3.3 ReviewForm | `src/components/reviews/ReviewForm.tsx` (new) |
| 4 | 4.1 ReviewModal | `src/components/review-modal/ReviewModal.tsx` (new) |
| 5 | 5.1 OrderItemReviewAction | `src/components/orders/OrderItemReviewAction.tsx` (new) |
| 5 | 5.2 WriteReviewButton | `src/components/orders/WriteReviewButton.tsx` (new) |
| 5 | 5.3 Update OrderCard | `src/components/account/OrderCard.tsx` (edit) |
| 6 | 6.1 ReviewCard | `src/components/reviews/ReviewCard.tsx` (new) |
| 6 | 6.2 ReviewList | `src/components/reviews/ReviewList.tsx` (new) |
| 6 | 6.3 RatingSummary | `src/components/reviews/RatingSummary.tsx` (new) |
| 6 | 6.4 ReviewFilters | `src/components/reviews/ReviewFilters.tsx` (new) |
| 6 | 6.5 ProductReviewsSection + product page integration | `src/components/reviews/ProductReviewsSection.tsx` (new), product page (edit) |
| 7 | 7.1 TestimonialCarousel | `src/components/home/TestimonialCarousel.tsx` (new) |
| 8 | 8.1 AggregateRating JSON-LD | product `page.tsx` (edit) |
| 8 | 8.2 Review JSON-LD | product `page.tsx` (edit) |
| 9 | 9.1 ReviewListSkeleton | `src/components/reviews/ReviewListSkeleton.tsx` (new) |
| 9 | 9.2 useDebounce + filter debounce | `src/lib/utils/useDebounce.ts` (new), `ReviewFilters.tsx` (edit) |
| 10 | 10.1 fmtDate utility | `src/lib/utils/date.ts` (new), 3 files (edit) |
| 10 | 10.2 orderStatus utility | `src/lib/utils/orderStatus.ts` (new), 2 files (edit) |
| 10 | 10.3 ReviewsErrorBoundary | `src/components/reviews/ReviewsErrorBoundary.tsx` (new) |
