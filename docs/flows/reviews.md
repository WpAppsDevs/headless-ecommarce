# Review flow

## Surfaces

| Surface | Component | Data |
| --- | --- | --- |
| Product page reviews accordion | `ProductTabs` → `ProductReviewsSection` | Aggregate from the server, list from `/api/reviews/product/:id` |
| Write review modal | `ReviewModal` → `ReviewForm` | Submitted through `/api/reviews/create` |
| Account order card | `OrderCard` → `ReviewModal` | Same form, with an `order_id` |
| Home testimonials | `TestimonialsSection` → `getRandomReviews` | Random approved reviews |
| JSON-LD | Product page | Aggregate rating only, and only when reviews exist |

## Reading reviews

The product page server component fetches the aggregate:

```
GET /wp-json/wpadhlwrapi/v1/reviews/aggregate/:product_id
```

It passes `initialAggregate` into `ProductTabs`, which renders `ProductReviewsSection`. If the aggregate is `null` or has zero reviews, the section shows "No reviews yet."

The list is fetched on the client:

```
GET /api/reviews/product/:product_id?page=1&per_page=5&orderby=created_at
```

`orderby` is `created_at` or `helpful_count`. The list renders only when the aggregate total is greater than zero, so a product with reviews hidden by moderation waiting can look empty.

The home page uses `getRandomReviews(limit)`, server-side with a 10-minute cache. It silently returns `[]` on failure.

## Aggregate shape

```ts
interface RatingAggregate {
  product_id: number;
  total_reviews: number;
  average_rating: number;
  distribution: Record<string, number>; // "1" … "5"
}
```

`RatingSummary` reads `distribution["5"]` and divides by `total_reviews`. A missing key becomes zero.

## Writing a review

```
ReviewForm
  → validate rating (1-5), content (10-5000), optional title (≤200)
  → POST /api/reviews/create { product_id, order_id?, rating, title?, content }
  → WordPress creates the review with status pending or approved
  → if images: upload one file at a time to /api/reviews/media/upload
  → markAsReviewed(productId)
  → toast success or warning
  → close modal / notify parent
```

The review is created before media uploads. If an image upload fails, the review remains and the user sees a warning. Media uploads are sequential, one request per file.

`submitReview` and the upload functions require an access token. The route forwards the `Authorization` header. A missing token returns 401 from the proxy without calling WordPress.

## Eligibility

`OrderCard` shows "Write Review" only when:

- the order status is `completed` or `processing`,
- the order is not fully refunded (`sum(abs(refund.total)) < order.total`),
- the product is not already in `reviewStore.reviewedProductIds`.

The review store is session-only. After a reload, the button can reappear for a product already reviewed. WordPress should reject the duplicate.

`ProductReviewsSection` also uses the store to replace the button with "You have reviewed this product."

## Moderation

A review response has `status: 'pending' | 'approved' | 'rejected'`.

- The form shows "Review published!" for `approved`.
- It shows "Review submitted — it will appear after approval" for `pending`.
- Rejected reviews are not shown in the product list.
- The list is not optimistically updated. The parent bumps the aggregate total, but the review appears only after the next list fetch.

## Error codes

`ReviewForm.friendlyError()` maps:

| Code | Copy |
| --- | --- |
| `already_reviewed` | You have already reviewed this product |
| `duplicate_review` | Identical review submitted recently |
| `rate_limited` | Too many reviews, wait 24 hours |
| `invalid_product` | Product not found |
| `no_token` | Log in first |
| anything else | Generic failure |

The form reads `err.code` first, then falls back to a bracketed code in the message. If you change the API error shape, update both.

## Media

`ReviewImageUpload`:

- accepts JPEG, PNG, GIF, and WebP,
- limits each file to 5 MB,
- limits the review to 5 files,
- shows previews through `URL.createObjectURL`,
- reports validation failures with `alert()`.

The upload route reads `formData()` and forwards it to WordPress without a `Content-Type` header, so the multipart boundary survives. Forward the multipart body untouched.

Review media is displayed in `ReviewCard` with a thumbnail grid and a lightbox. Images use `unoptimized` because the source is a remote URL that may not be in the image optimizer's allowlist at build time.

## Deleting a review

`deleteReview(id)` exists in `src/lib/api/reviews.ts` and `DELETE /api/reviews/:id` exists, but no UI calls it. It requires a token and forwards the delete.

## Caching

| Endpoint | Cache |
| --- | --- |
| Product reviews | no-store |
| Aggregate (server) | 5 minutes |
| Aggregate (browser) | no-store |
| Random reviews (server) | 10 minutes |
| Random reviews (browser) | no-store |

The server-side product page uses the aggregate cache for JSON-LD and the initial summary. The client list is always fresh.

## Test cases

- Logged-out product page shows "Log in to write a review".
- Logged-in user with no previous review sees the form.
- Rating 0 keeps submit disabled.
- Content shorter than 10 characters is rejected.
- Approved review appears after refresh; pending review shows the pending toast.
- Duplicate review shows the friendly message.
- Image over 5 MB is rejected without blocking the review text.
- Fully refunded order hides the review action.
- Order with `checkout-draft` status is not shown at all.

## Related

- [../data-layer.md](../data-layer.md)
- [../components.md](../components.md)
- [../routing-and-pages.md](../routing-and-pages.md)
