# Known gaps

These are current behaviors, not aspirations. Each entry says what happens, where, and what a fix would touch. They are ordered by impact.

## 1. Auth does not rehydrate after a reload for most signed-in users

`authStore.hydrate()` returns early when there is no `localStorage['cart_token']` and no cached access token. A user who logged in after the guest token was cleared has neither. The refresh cookie is never tried, so a full reload logs them out.

- Where: `src/stores/authStore.ts`, `hydrate()`.
- Fix direction: attempt refresh whenever the refresh cookie may exist. A lightweight `GET /api/auth/me` probe or a server-set hint cookie would distinguish a fresh visitor from a signed-in one without a doomed request per visitor.
- Impact: high. Account and checkout are client-guarded and will redirect to login.

## 2. Lint is not clean

`npm run lint` reports five errors and twenty-one warnings.

Errors:

- `src/app/order-confirmation/[id]/page.tsx:28` — `setState` synchronously in an effect.
- `src/components/account/Address.tsx:9` — explicit `any`.
- `src/components/review-modal/ReviewModal.tsx:40` — `setState` in an effect.
- `src/components/reviews/ReviewList.tsx:43` — `setState` in an effect.
- `src/components/shop/ShopClient.tsx:38` — unescaped apostrophe.

Warnings are mostly unused imports and variables. `npx tsc --noEmit` passes.

- Impact: medium. CI has no lint gate, but new code should not add errors.
- Fix direction: handle one file at a time; do not mix a lint cleanup with a feature change.

## 3. There is no test suite

No unit, integration, or end-to-end tests exist. There is no runner configured.

- Impact: high for regressions in checkout, auth, and cart.
- Fix direction: start with the flows that carry money or identity. Playwright against a seeded WordPress environment would cover checkout, guest cart merge, login reload, and tracking. Pure normalizers (`normalizeTrackingResult`, `filterCheckoutDrafts`, currency formatting) are cheap unit tests.

## 4. Guest checkout is advertised but not implemented

`config.features.guestCheckout` is `true`. `/checkout` calls `getUser()` and redirects to login when it fails with an auth error.

- Where: `src/lib/config.ts`, `src/app/checkout/page.tsx`.
- Impact: medium. The flag misleads anyone reading config as behavior.
- Fix direction: either implement guest orders in WordPress and the page, or remove the flag.

## 5. Cart page fetches twice

`CartHydrator` fetches on layout mount, and `CartPageContent` fetches again on mount. There is no request de-duplication.

- Where: `src/components/layout/CartHydrator.tsx`, `src/components/cart/CartPageContent.tsx`.
- Impact: low, extra requests.
- Fix direction: a store-level `lastFetchedAt` or remove the page-level fetch and rely on the hydrator.

## 6. Coupon, free shipping, and cart expiry are UI-only

All three are behind `SETTINGS` flags that are off. Turning one on does not connect it to an API.

- Coupon: logs the code to the console.
- Free shipping: local threshold constant.
- Expiry: local countdown, not tied to the server cart.
- Where: `src/components/cart/CartPageContent.tsx`, `src/components/cart/CartDrawer.tsx`, `src/components/cart/CouponSection.tsx`.
- Impact: low while off, high if someone turns a flag on without knowing.

## 7. Two shipping price sources

`CartSummary` uses hardcoded prices (free, 35, 35) and its own state. Checkout uses `cartStore.shippingMethods` from the cart API, with the same values as fallback.

- Where: `src/components/cart/CartSummary.tsx`, `src/components/checkout/CheckoutForm.tsx`, `src/lib/api/cart.ts`.
- Impact: medium if WordPress shipping rates change. The cart summary can disagree with checkout.
- Fix direction: one source, preferably the cart API, with a shared fallback constant.

## 8. Policy copy is duplicated and inconsistent

The shipping and returns policy pages are Bengali. The product page's "Shipping & Returns" accordion is English, hardcoded, and lists different delivery windows and thresholds.

- Where: `src/components/product/ProductTabs.tsx`, `src/app/shipping/page.tsx`, `src/app/returns/page.tsx`.
- Impact: medium, customer-facing contradiction.
- Fix direction: make the accordion read from a shared content module or link to the policy page.

## 9. Account actions are placeholders

- Settings save waits 600 ms and shows success; no API call.
- Address edit has no handler.
- Cancel order has no handler.
- Review delete exists in the API layer but has no UI.
- Where: `src/components/account/Settings.tsx`, `Address.tsx`, `OrderCard.tsx`, `src/lib/api/reviews.ts`.

## 10. Wishlist survives logout

`authStore.logout()` clears cart and review state but not the wishlist store. The header count can show the previous user's wishlist until reload.

- Where: `src/stores/authStore.ts`.
- Fix direction: add `wishlistStore.clear()` or re-hydrate as a guest after logout.

## 11. Order confirmation depends on `sessionStorage`

A refresh or direct visit to `/order-confirmation/[id]` shows the heading but no status or payment details. The page does not fetch the order.

- Where: `src/app/order-confirmation/[id]/page.tsx`.
- Impact: medium. Customers often refresh or bookmark this page.
- Fix direction: fetch the order by ID with the auth token, or add a public confirmation endpoint keyed by order key.

## 12. Header fallback links to a missing page

`STATIC_NAV_LINKS` includes `/contact`, but no `src/app/contact` route exists. If the WordPress `primary` menu is empty or unreachable, the fallback renders a 404 link.

- Where: `src/components/layout/Header.tsx`.
- Fix direction: add the page or remove the link from the fallback.

## 13. Order-draft filtering lives in several places

`filterCheckoutDrafts` is called in `orders.ts`, the account orders proxy, `Dashboard`, `Orders`, and `OrdersList`; tracking has its own `isCheckoutDraftStatus` checks.

- Impact: low, but a new order surface can forget the filter.
- Fix direction: filter once at the API boundary and remove redundant UI filters, or keep the UI filters as documented backstops.

## 14. `apiClient` does not check `res.ok`

A non-2xx response whose body is not `{ success: false }` can be returned as data. Modules that need the status use raw `fetch`.

- Where: `src/lib/api/client.ts`.
- Impact: low for the current wrapper contract, medium for new endpoints.
- Fix direction: throw on non-2xx unless a caller opts out.

## 15. Unused or parallel code

- `/api/product-filters` is not called by the client.
- `src/lib/api/user.ts` is empty.
- `useDebounce` is unused.
- `OrdersList` duplicates the orders table inside `AccountLayout`, which uses `Orders`.
- `NewsletterSection`, `InstagramSection`, and `TestimonialCarousel` are not used by the home page.
- `PromoBanners` is imported but commented out.
- `Price` and rating aggregate fetches on the product page run sequentially despite a comment saying parallel.

## 16. Dark mode is defined but unwired

`globals.css` has a `.dark` block. No class is applied, no toggle exists, and many components are not audited for dark contrast.

## 17. No server-side route protection

There is no middleware. `/account` and `/checkout` redirect on the client. A user can load the shell before the redirect, and the server sends the page HTML. WordPress still rejects data requests, but the page is not protected at the edge.

- Fix direction: middleware that checks the refresh/access cookie for those routes, or server pages that read cookies. Weigh the auth rehydration fix in item 1 first.

## 18. `CodeDocs.md` is stale

The root `CodeDocs.md` predates the current review, tracking, policy, and account work. `docs/` supersedes it. Keep `ApiDocs.md` as an upstream contract reference, but verify against the code before relying on it.

## 19. Duplicate empty directories

`src/app/\(shop\)` and `src/app/order-confirmation/\[id\]` exist as empty, escaped-name directories from an earlier move. They are untracked and do not affect the build. Remove them from the working copy if they confuse tooling.

## 20. No error reporting

Errors go to `console.error` in `error.tsx`. There is no Sentry or equivalent, so production failures are invisible unless someone checks logs.

## How to use this list

Pick one item per change. Do not fold a refactor into a feature unless the feature requires it. When you fix an item, update this file and the affected flow doc in the same commit.
