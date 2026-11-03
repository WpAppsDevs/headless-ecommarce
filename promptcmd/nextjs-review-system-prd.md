Next.js Review System PRD

# PRD — Next.js Integration for Custom Review System

## Project Overview

This PRD defines how the custom review system will be implemented inside the existing Next.js headless storefront.

The implementation MUST follow the existing Next.js architecture and UI patterns.

---

# Core Objectives

- Consume custom review APIs

- Build scalable review UI

- Support filtering and sorting

- Support media reviews

- Support review submission

- Support review voting

- Maintain SEO compatibility

- Optimize frontend performance

---

# Frontend Architecture

Product Page

↓

Review Components

↓

Review API Layer

↓

Custom Headless API

---

# Recommended Frontend Structure

src/

├── components/reviews/

├── components/review-form/

├── components/review-media/

├── components/review-filters/

├── components/review-modal/          ← NEW: modal wrapper for orders-page submission

├── components/orders/                ← NEW: WriteReviewButton + OrderItemReviewAction

├── services/reviews/

├── hooks/

├── store/

├── types/

└── utils/

---

# Recommended Components

- Review List

- Review Card

- Review Form

- Review Filters

- Review Media Gallery

- Rating Summary

- **ReviewModal** ← NEW: modal dialog for in-context review submission

- **WriteReviewButton** ← NEW: per-line-item CTA on the Orders List page

- **OrderItemReviewAction** ← NEW: smart wrapper — shows "Write Review", "Reviewed ✓", or nothing based on eligibility

---

# API Integration Requirements

Required methods:

- getProductReviews

- createReview

- uploadReviewMedia

- voteReview

- deleteReview

- **getOrders** — used to derive per-product review eligibility from `line_items` (see `API Documentation.md` §9.1)

> **Note:** There is no dedicated review-eligibility endpoint. Eligibility is computed on the frontend from the `GET /api/orders` response (order status + refund totals). The `is_verified` flag is enforced server-side automatically by the review submission endpoint (`POST /api/reviews`).

---

# UX Requirements

- Skeleton loaders

- Optimistic updates

- Error states

- Empty states

- Mobile responsive design

- Accessible UI

---

# SEO Requirements

Frontend MUST support:

- AggregateRating schema

- Review schema

- SSR-compatible metadata

---

# Performance Requirements

- Lazy loading

- API caching

- Debounced filters

- Avoid duplicate requests

- Optional infinite scroll

---

# Security Requirements

- Validate uploads

- Sanitize user content

- Secure token handling

- Prevent XSS rendering

---

# Deliverables

- Review components

- API service layer

- Review submission flow

- Media upload system

- Review filtering UI

- Rating summary UI

- SEO integration

---

# API Endpoint Documentation
- `API Documentation.md`

---

# Purchase-Verified Review Flow (My Account → Orders Page)

## Overview

Customers who have purchased a product can submit a verified review directly from the **My Account → Orders List** page. A **"Write Review"** button appears beside the **"Cancel Order"** button for each eligible product within a qualifying order. Clicking it opens a `<ReviewModal />` pre-filled with product context, where the customer can submit a star rating, review title, review text, and optional images.

This flow is distinct from the generic review form on the Product Detail Page (PDP). It guarantees `is_verified: true` on submission because the server automatically verifies purchase history when the authenticated user submits a review — no extra client-side proof is required.

> **API Reference:** `API Documentation.md` §9.1 (Orders), §14.4 (Submit Review), §14.6 (Upload Media), §14.8 (Review System Notes).

---

## Review Eligibility Criteria (Frontend Logic)

The "Write Review" button is rendered per `line_item` inside an order when **all** of the following conditions are true:

| Condition | Data Source | Rule |
|---|---|---|
| User is authenticated | Auth context / JWT store | Bearer token must be present |
| Order status qualifies | `order.status` | Must be `"completed"` or `"processing"` |
| Order is not fully refunded | `order.refunds[]` + `order.total` | Sum of all `refund.total` values must be less than `order.total` |
| Product not yet reviewed | Local session state + API error `already_reviewed` | No existing review submitted for this `product_id` in this session |

> **Important:** This frontend check is a **UI optimisation only** — it prevents obviously ineligible button clicks. The server enforces its own eligibility, rate limits, and duplication checks independently. Do not rely solely on the frontend to prevent invalid submissions.

---

## UI Flow (Step-by-Step)

### Step 1 — Orders List Page Load

1. User navigates to **My Account → Orders**.
2. Frontend verifies auth; if no valid JWT, redirect to login with `?returnTo=/account/orders`.
3. Fetch orders: `GET /api/orders?per_page=10` (see `API Documentation.md` §9.1).
4. For each order, render an **order card** showing `line_items`.

### Step 2 — Per-Line-Item Action Button Rendering

For each `line_item` in each order, render an `<OrderItemReviewAction />` component:

- **Show "Write Review" button** if eligibility criteria above are all met.
- **Show "Reviewed ✓" badge** (disabled, non-clickable) if the product was already reviewed in the current session (tracked in local/component state after successful submission, or pre-seeded from a "my reviews" check if available).
- **Show nothing** if the order status is `pending`, `on-hold`, `cancelled`, or `failed`.

The "Write Review" button is placed inline with other order-item actions (e.g., beside "Cancel Order").

### Step 3 — Review Modal Opens

When the customer clicks **"Write Review"**, open `<ReviewModal />` with:

| Pre-filled Context | Source |
|---|---|
| `product_id` | `line_item.product_id` (parent product ID, even for variations) |
| `product_name` | `line_item.name` (includes variant attributes, e.g. "Classic Tee — Red / S") |
| `product_image` | `line_item.image` (fallback to placeholder if `""`) |
| Display context | "Ordered on {date} · Order #{number}" |

### Step 4 — Review Form Fields

| Field | Type | Required | Constraints |
|---|---|---|---|
| Star rating | 1–5 selector | ✅ | Integer 1–5 |
| Review title | Text input | ❌ | Optional headline |
| Review content | Textarea | ✅ | Non-empty after whitespace trim |
| Images | File input (multi) | ❌ | Up to 5 files; JPEG, PNG, GIF, WebP; max 5 MB each |

### Step 5 — Submission (Two-Step API Call)

1. **Step 5a:** `POST /api/reviews` — creates the review.
   - On `201`: receive `review_id`. Proceed to Step 5b if images were selected.
   - On error: show inline error message (see Edge Cases below). Keep modal open.

2. **Step 5b (if images selected):** `POST /api/reviews/{review_id}/media` — attaches images.
   - On `201`: all done.
   - On error: review is already saved — show warning: *"Review submitted, but image upload failed."* Offer a retry link for media only.

### Step 6 — Post-Submission State

- Close the modal.
- Mark the product as reviewed in local state (replace "Write Review" with "Reviewed ✓" badge).
- Show a **success toast**: *"Your review has been submitted and is pending approval."*

---

## API Flow

```
User on My Account → Orders List
  │
  ├─► GET /api/orders                         (Authorization: Bearer <access_token>)
  │     └─ Response: orders[].line_items[].product_id, .status, .refunds
  │
  └─► [Frontend] Compute eligibility per line_item
        │
        └─► User clicks "Write Review"
              │
              └─► ReviewModal opens (pre-filled)
                    │
                    └─► User submits form
                          │
                          ├─► POST /api/reviews                   (Bearer JWT)
                          │     body: { product_id, rating, title, content }
                          │     └─ 201: { id: review_id, is_verified: true, status: "pending" }
                          │
                          └─► (if images) POST /api/reviews/{review_id}/media   (Bearer JWT, multipart)
                                body: FormData { media[] }
                                └─ 201: [{ id, file_url, file_type }]
```

> See `API Documentation.md` §14.4 and §14.6 for full request/response specifications.

---

## Authentication & Authorization Flow

| Step | Requirement | How Enforced |
|---|---|---|
| View orders page | Valid Bearer JWT (user, not guest) | API returns `401`; frontend redirects to login |
| "Write Review" button visibility | User is authenticated | Button not rendered if no JWT present in auth context |
| Submit review | Valid Bearer JWT | `POST /api/reviews` returns `401` if token missing/expired |
| `is_verified` flag | User has `completed`/`processing` order for the product | Set **server-side automatically** — no client input required |
| Upload media | Valid Bearer JWT + review ownership | `POST /api/reviews/{review_id}/media` returns `403` if acting user is not review owner |

### Token Expiry During Submission

If the access token expires between page load and form submission:

1. Catch `401` response from `POST /api/reviews`.
2. Attempt silent token refresh via `POST /api/auth/refresh` (see `API Documentation.md` §5.2).
3. If refresh succeeds: retry the original review submission with the new token.
4. If refresh fails: redirect to login with `?returnTo=/account/orders`, preserving form state in `sessionStorage` where feasible.

---

## Order/Product Relationship Handling

- The `GET /api/orders` response includes `line_items[].product_id` — always the **parent product ID**, even for variation line items (e.g., a "Red / S" variation returns the parent T-shirt's product ID).
- `line_items[].variation_id` is available for display but the review is always submitted against `product_id` — the API does not support per-variation reviews.
- `line_items[].name` includes variant attributes and is used as the review modal's display label.
- `line_items[].image` provides the product thumbnail; falls back to `""` if the product was deleted — use a placeholder in the UI.
- Multiple line items in the same order may share the same `product_id` (e.g., the customer ordered the same product twice in different colours). Deduplicate by `product_id` when rendering review buttons to avoid showing multiple "Write Review" buttons for the same underlying product.

---

## Edge Cases

| Scenario | Frontend Handling | API Response |
|---|---|---|
| **Duplicate review** — user already reviewed this product | Replace "Write Review" with "Reviewed ✓" badge; on API error catch `already_reviewed` and show: *"You've already reviewed this product."* | `409 already_reviewed` |
| **Guest / unauthenticated user** | Orders page requires auth — redirect to login. "Write Review" button never rendered without a valid JWT. | `401` on all review endpoints — guests cannot submit reviews. |
| **Fully refunded order** | Compute: if `∑ Math.abs(refund.total) >= parseFloat(order.total)`, treat order as ineligible — hide "Write Review". | `is_verified` may still be truthy server-side if the order had `completed` status before refund; this is intentionally a frontend-only UX restriction. |
| **Partially refunded order** | If the refund is partial and the order status is still `completed` or `processing`, show "Write Review". The API does not track per-item refunds. | `is_verified: true` set if overall order qualifies. |
| **`processing` status order** | Show "Write Review" — the customer has paid; server will set `is_verified: true`. | `is_verified: true` automatically. |
| **`pending` or `on-hold` order** | Hide "Write Review" — payment not yet confirmed. | Would result in `is_verified: false` if submitted; not surfaced to user. |
| **`cancelled` or `failed` order** | Hide "Write Review" entirely. | `is_verified: false` if submitted. |
| **Rate limit reached** | Catch `429 rate_limited`; disable submit button; show: *"You've reached the daily review limit. Please try again tomorrow."* | `429 rate_limited` after 3 reviews within 24 hours. |
| **Duplicate content** | Catch `409 duplicate_review`; show inline error: *"This review content was already submitted recently. Please write a unique review."* | `409 duplicate_review` for identical content. |
| **Product deleted between order and review** | `line_item.image` returns `""`; use placeholder. On submit, catch `404 invalid_product`; show: *"This product is no longer available for review."* Disable "Write Review" button. | `404 invalid_product`. |
| **Media upload fails after review is created** | Review is already saved (Step 5a succeeded). Show warning toast: *"Review submitted, but image upload failed."* Provide a retry button that calls `POST /api/reviews/{review_id}/media` without re-creating the review. | `500 upload_failed` from media endpoint. |
| **Token expires mid-submission** | Silent refresh attempt → retry. If refresh fails → redirect to login with `?returnTo=/account/orders`. | `401` from review or media endpoint. |
| **Network error / server error** | Show error toast: *"Something went wrong. Please try again."* Keep modal open to preserve form state. Allow manual retry. | `500 insert_failed` or network failure. |
| **Multiple identical products in one order** | Deduplicate `line_items` by `product_id` — only one "Write Review" button per unique product per order. | No impact; deduplication is purely a UI concern. |

---

# AI IMPLEMENTATION INSTRUCTIONS

When this PRD is provided to an AI coding assistant:

1. Analyze the entire PRD first.

2. Generate a detailed implementation task list.

3. Break the implementation into phases.

4. Generate step-by-step implementation prompts.

5. Save all generated implementation prompts into a separate file named:

nextjs-review-implementation-prompts.md

6. The generated prompt file MUST include:

- Sequential implementation prompts

- Component implementation prompts

- API integration prompts

- State management prompts

- Testing prompts

- Refactoring prompts

- Optimization prompts

7. Every generated prompt MUST follow the existing Next.js project structure and coding standards.

8. The AI MUST NOT rewrite the frontend architecture unless explicitly requested.

9. The AI MUST generate implementation prompts in small manageable tasks.

10. The AI MUST prioritize scalable architecture, reusable components, and production-ready code.