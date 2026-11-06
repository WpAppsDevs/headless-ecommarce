# Fix plan

A sequenced remediation plan for [known-gaps.md](known-gaps.md). Section numbers match the gap numbers. Each entry says what to change, where, how to verify it, and whether it needs WordPress work.

## Priority overview

| # | Gap | Priority | Effort | Backend needed |
| --- | --- | --- | --- | --- |
| 1 | Auth reload | P0 | S | No |
| 2 | Lint errors | P1 | S | No |
| 3 | No tests | P1 | L | No |
| 4 | Guest checkout flag | P1 | S to remove, L to implement | Yes for implementation |
| 5 | Double cart fetch | P2 | S | No |
| 6 | Cart UI flags | P2 | S | No |
| 7 | Two shipping sources | P2 | S | No |
| 8 | Policy copy duplication | P2 | S | No |
| 9 | Account placeholders | P2 | M-L | Yes |
| 10 | Wishlist after logout | P2 | S | No |
| 11 | Confirmation depends on session | P2 | M | Yes for full fix |
| 12 | Missing contact page | P3 | S | No |
| 13 | Draft filtering spread out | P3 | S | No |
| 14 | `apiClient` ignores `res.ok` | P2 | S, risky | No |
| 15 | Unused code | P3 | S | No |
| 16 | Dark mode unwired | P3 | S or M | No |
| 17 | No server route guard | P3 | M | No |
| 18 | `CodeDocs.md` stale | Done | — | No |
| 19 | Empty escaped directories | P3 | S | No |
| 20 | No error reporting | P3 | M | No |

S = hours, M = a day or two, L = several days.

## Recommended order

1. **Stability sprint:** 1, 2, 10, 6, 7, 5.
2. **Correctness sprint:** 3 (unit tests first), 14, 11, 12, 13, 8.
3. **Product completeness:** 9, 4, 17, 20.
4. **Cleanup:** 15, 16, 19.

Do not start with 3 (tests) if the suite would immediately encode the auth bug as expected behavior. Fix 1 first, then write the test that keeps it fixed.

---

## 1. Auth does not rehydrate after reload

**Root cause.** `authStore.hydrate()` returns before calling `/api/auth/refresh` when `localStorage['cart_token']` and `tokenCache` are both empty. A signed-in user who has no guest cart token has neither.

**Recommended fix: a non-secret session hint cookie.**

The refresh cookie is httpOnly, so JavaScript cannot check it. Add a readable boolean cookie that says only "a session may exist". It carries no credential.

1. In `src/app/api/auth/login/route.ts`, `register/route.ts`, and on a successful `refresh/route.ts`, set:

```ts
response.cookies.set('session_hint', '1', {
  httpOnly: false,
  secure: IS_PROD,
  sameSite: 'lax',
  path: '/',
  maxAge: 14 * 24 * 60 * 60,
});
```

2. In `logout/route.ts` and in the refresh failure path, expire it:

```ts
response.cookies.set('session_hint', '', { ...COOKIE_BASE, httpOnly: false, maxAge: 0 });
```

3. In `authStore.hydrate()`:

```ts
const hasGuestCart = typeof window !== 'undefined' && localStorage.getItem('cart_token');
const hasTokenCache = tokenCache.get();
const hasSessionHint =
  typeof document !== 'undefined' &&
  document.cookie.split('; ').includes('session_hint=1');

if (!hasGuestCart && !hasTokenCache && !hasSessionHint) {
  set({ hydrated: true });
  return;
}
```

4. Keep the rest of the refresh and profile fetch unchanged.

**Alternative.** Add `GET /api/auth/session` that reads the cookies server-side and returns `{ hasSession: boolean }`. Call it once in hydration. It costs one request for every visitor but keeps the hint out of JavaScript-readable storage. Choose this if a readable cookie is not acceptable.

**Do not** call refresh unconditionally for every anonymous visitor. It works, but it puts a guaranteed 401 in every page load and hides real failures in noise.

**Acceptance**

- Signed in, reload `/account`: still signed in.
- Anonymous reload: no `/api/auth/refresh` request.
- Expired refresh: hint and refresh cookies cleared, user stays signed out.
- Guest with a stale cart token: no login redirect loop.
- Logout clears the hint.

**Test.** Add an E2E case: log in, reload, assert the account page renders. Add a unit test for the early-return predicate if you extract it.

## 2. Lint is not clean

Fix the five errors in place. Do not disable the rules globally.

### `ShopClient.tsx:38`

Replace the apostrophe in the empty-state copy:

```tsx
Try adjusting your filters or search terms to find what you&apos;re looking for.
```

### `Address.tsx:9`

Remove `any`. Use an explicit display type so the fields the component actually reads are allowed:

```ts
type DisplayAddress = Partial<{
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}> | null;

function AddressBlock({ title, address }: { title: string; address: DisplayAddress }) {
```

`profile?.billing` and `profile?.shipping` both fit the union. The display type also covers `address_2` and `company`, which the current `AddressFields` type omits.

### `ReviewModal.tsx:40`

The effect resets `selectedItem` when the modal opens. Derive it instead.

```tsx
const [selectedId, setSelectedId] = useState<number | null>(null);

const selectedItem =
  items.find((item) => item.product_id === selectedId) ??
  (items.length === 1 ? items[0] : null);

function handleClose() {
  setSelectedId(null);
  onClose();
}
```

Replace `setSelectedItem(item)` with `setSelectedId(item.product_id)`, the back button with `setSelectedId(null)`, and every `onClose` call with `handleClose`. Delete the reset effect.

### `ReviewList.tsx:43`

The effect calls `load()`, which sets state synchronously. Move loading state changes into event handlers and let the effect only set state after an `await`.

```tsx
useEffect(() => {
  let cancelled = false;

  (async () => {
    const result = await getProductReviews(productId, page, PER_PAGE, sort);
    if (cancelled) return;
    setReviews(result.reviews);
    setMeta(result.meta);
    setError(null);
    setLoading(false);
  })().catch(() => {
    if (!cancelled) {
      setError('Could not load reviews. Please refresh the page.');
      setLoading(false);
    }
  });

  return () => {
    cancelled = true;
  };
}, [productId, page, sort]);
```

On initial render `loading` starts `true`. In the sort and pagination handlers, call `setLoading(true)` before `setSort` / `setPage`. That keeps the spinner without a synchronous set in the effect.

### `order-confirmation/[id]/page.tsx:28`

This one is a one-time read from `sessionStorage`. A targeted suppression is honest:

```tsx
// eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the order result written by checkout
setOrder(JSON.parse(raw));
```

Long term, replace the read with a server fetch (see item 11), which removes the effect entirely.

**Acceptance.** `npm run lint` has zero errors. Warnings may remain, but do not add new ones.

## 3. No test suite

Start small and test the logic that does not need a browser.

1. Add Vitest, jsdom, and Testing Library as dev dependencies.
2. Add `test`, `test:watch`, and `test:coverage` scripts.
3. Add `vitest.config.ts` with the `@` alias and `jsdom`.
4. Export the pure functions that are currently private:
   - `formatPrice` from `src/lib/utils/currency.ts`
   - `normalizeTrackingResult` and `normalizeTimeline` from `src/lib/api/tracking.ts`
   - the product image/variation normalizers if you test them directly
5. First tests:
   - `filterCheckoutDrafts` removes only `checkout-draft`.
   - `normalizeTrackingResult` handles all three shapes and drops drafts.
   - `normalizeTimeline` corrects the "Order Placed" date and creates a fallback.
   - `formatPrice` handles all four symbol positions, zero decimals, and NaN.
   - `getShippingMethods` returns API methods when present and the fallback otherwise.

Then add Playwright for flows that need a browser and a backend:

- guest add to cart → login → cart survives,
- signed-in reload (item 1),
- checkout BACS success and Stripe failure,
- tracking guest and signed-in lookups,
- review submit and validation.

Use route interception for proxy responses if CI has no WordPress. Do not mock the code under test.

**Acceptance.** `npm test` runs without a WordPress instance. A pull request that touches checkout, auth, cart, or tracking adds or updates a test.

## 4. Guest checkout flag

The flag is unused. The smallest fix is to remove it from `src/lib/config.ts`, because no code reads `config.features`.

```ts
export const config = {
  apiBase: WP_URL + '/wp-json',
  productsNs: 'wpadhlwrapi/v1',
  apiNs: 'api',
  siteName: ...,
  hero: { ... },
} as const;
```

If guest checkout is a real requirement, the frontend change is the small part. The backend must:

- accept a guest cart token at `POST /api/checkout` and create an order without a user,
- return an order key or signed confirmation token,
- expose a confirmation lookup that does not require an account.

Then `/checkout` must not call `getUser()` as a gate, and the confirmation page needs the guest lookup. Do not implement a client-only guest checkout; it would create orders the backend cannot attribute.

**Acceptance for removal.** No `features` object, no stale flag, checkout still requires login.

## 5. Double cart fetch

`CartHydrator` fetches once, then `CartPageContent` fetches again.

Add a `fetchedAt` or `hydrated` marker to `cartStore` and use it on the page:

```ts
// cartStore state
lastFetchedAt: number | null;

fetchCart: async () => {
  ...
  set({ ..., lastFetchedAt: Date.now() });
},
```

```tsx
// CartPageContent
useEffect(() => {
  const { items, lastFetchedAt, loading } = useCartStore.getState();
  if (items.length === 0 && !lastFetchedAt && !loading) {
    void fetchCart();
  }
}, [fetchCart]);
```

Alternatively remove the page-level fetch and rely on the hydrator. That is simpler but loses retry if hydration failed. The marker keeps retry and removes the duplicate.

**Acceptance.** Opening `/cart` as a signed-in user produces one cart GET, not two.

## 6. Coupon, free shipping, and cart expiry

They are off and not connected. Choose one direction.

**Recommended: remove the dead UI until a backend exists.**

- Delete the `SETTINGS` objects from `CartPageContent.tsx` and `CartDrawer.tsx`.
- Remove the conditional blocks and unused imports.
- Delete `CouponSection.tsx`, `FreeShippingBar.tsx`, and the `CartExpiryBanner` local component, or keep them in a branch. Do not leave components that look live but do nothing.
- Keep the copy "Shipping calculated at checkout" if needed.

**If the features are wanted now, the contracts are:**

- Coupon: a WordPress endpoint to validate and apply a coupon to the current cart, returning discount lines. None exists in the client API layer.
- Free shipping: `store-settings` or the cart response must return the threshold. The current value is a frontend constant.
- Expiry: the server must own cart expiry. A local countdown lies when the server has a different TTL.

**Acceptance.** No flag exists that a reader could mistake for working behavior. If a feature is enabled, its data comes from the API.

## 7. Two shipping sources

`CartSummary` hardcodes prices and state. Checkout uses the store's methods.

1. Export the fallback from `src/lib/api/cart.ts`:

```ts
export const DEFAULT_SHIPPING_METHODS = [
  { id: 'free_shipping', label: 'Free Shipping', cost: '0.00' },
  { id: 'local_pickup', label: 'Local — Local delivery', cost: '35.00' },
  { id: 'flat_rate', label: 'Flat Rate — Standard shipping', cost: '35.00' },
];
```

Use it inside `getShippingMethods`.

2. In `CartSummary`, read methods from the store:

```tsx
const methods = useCartStore((s) => s.shippingMethods) ?? DEFAULT_SHIPPING_METHODS;
```

Remove `SHIPPING_OPTIONS` and `shippingCost` from local state.

3. Decide what the cart summary selection means. It is not persisted to the cart or passed to checkout. Either:

- remove the radios and show method prices plus "Choose shipping at checkout", or
- add a `setChosenShippingMethod` action and make checkout use it. That second option needs a backend update if the choice should persist before checkout.

The truthful small fix is to remove the radios from the cart summary. Checkout already selects a method.

**Acceptance.** A price shown on `/cart` matches the same method on `/checkout`. There is one fallback list in the codebase.

## 8. Policy copy duplication

The product accordion hardcodes English copy and different numbers from the Bengali policy pages.

**Recommended.** Replace the accordion body with a short summary and links:

```tsx
<div className="space-y-3 text-sm text-[#5A5A5A]">
  <p>Delivery times and charges depend on whether the item is in stock or pre-order.</p>
  <Link href="/shipping" className="font-medium text-[#9E2F45] underline">
    Read the shipping and delivery policy
  </Link>
  <Link href="/returns" className="block font-medium text-[#9E2F45] underline">
    Read the returns and exchange policy
  </Link>
</div>
```

This removes the contradiction without duplicating Bengali content in English.

If the accordion must contain details, create one typed content module (`src/lib/content/shipping.ts`) and render both the page and the accordion from it. Do not copy numbers into two components.

**Acceptance.** The shipping page and product accordion cannot disagree.

## 9. Account placeholders

Every control either calls an API or is removed. Do not ship a button that cannot succeed.

**Settings and address edit.** The wrapper API documents only `GET /api/user`. It has no profile update endpoint. Options:

1. Add `PUT /api/user` (or `POST /api/user/profile`) in WordPress, then:
   - add `src/app/api/account/profile/route.ts`,
   - implement `updateProfile` in `src/lib/api/user.ts` (currently empty),
   - call it from `Settings.tsx`,
   - use the same call for address editing.
2. Remove the form controls until the endpoint exists.

**Cancel order.** No endpoint exists. Either add `POST /api/orders/:id/cancel` in WordPress, with status and ownership checks, or remove the button.

**Review delete.** The client call exists, but the review response does not include an ownership flag. Add `can_delete` (or the author user ID) to the review payload, then show a delete action only when true. Do not infer ownership from the author name.

**Acceptance.** No visible account action is a no-op. If an action fails, the user sees an error and the control re-enables.

## 10. Wishlist survives logout

Add a clear action and call it wherever auth state is torn down.

```ts
// wishlistStore
clear: () => set({ ids: [], count: 0, pendingIds: new Set(), hydrated: false }),
```

Call it:

- in `authStore.logout()` after clearing the cart,
- in the unauthorized handler after clearing the cart.

If product decisions say a guest should see their pre-login wishlist after logout, call `hydrate(false)` instead, but the guest list was cleared during `syncGuestWishlist()`, so `clear()` is the accurate state.

**Acceptance.** Log out and the header heart badge drops to zero without a reload. Log in as another user and see only that user's list.

## 11. Order confirmation depends on sessionStorage

A refresh loses the order data. Two paths:

**Full fix.** Add a WordPress endpoint for one order (`GET /api/orders/:id` or a signed confirmation endpoint), proxy it under `/api/account/orders/:id`, and fetch it on mount. Keep sessionStorage only as a fast first paint.

**Interim fix.** After item 1 so `tokenCache` is populated on reload, fetch `getOrders(1, 100)` for signed-in users and find the order by ID. This covers recent orders and removes the blank state for most refreshes. The `Order` type lacks `transaction_id`, so the payment reference still needs either a backend field or the stored session result.

```ts
const { orders } = await getOrders(1, 100);
const found = orders.find((order) => order.id === Number(id)) ?? null;
```

If neither is available, render a link to `/account` instead of an empty confirmation screen.

**Acceptance.** Refresh `/order-confirmation/:id` and still see the status. Direct navigation shows either the order or a useful next step, not a bare heading.

## 12. Missing contact page

Either add `src/app/contact/page.tsx` with the support channels already in the footer, or remove `{ href: '/contact', label: 'CONTACT' }` from `STATIC_NAV_LINKS` in `Header.tsx`.

The footer already exposes email, phone, and WhatsApp. Adding the page is a small static page; removing the link is a two-line change. Pick one.

**Acceptance.** No static nav link returns 404.

## 13. Draft filtering spread out

The API boundary already filters orders in `getOrders` and `/api/account/orders`, and tracking filters in its normalizer. The UI also filters in `Dashboard`, `Orders`, and `OrdersList`. That is a backstop, not a bug.

Decide on one rule:

- **Keep the backstop.** Document it as intentional and add a test that every order surface filters drafts. No code change beyond the test.
- **Remove the duplicates.** Trust the API boundary, delete the UI filters, and add a test on the boundary.

Do not remove the UI filters without a test that the API boundary still filters after pagination adjustment.

**Acceptance.** A `checkout-draft` order cannot appear in orders, dashboard, tracking, or confirmation.

## 14. `apiClient` ignores `res.ok`

Add a status check in `parseBody` or after the response:

```ts
if (!res.ok) {
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }
  if (json && typeof json === 'object' && 'success' in json && (json as { success: unknown }).success === false) {
    const err = json as { code?: string; message?: string };
    throw new ApiError(err.code ?? 'api_error', err.message ?? `HTTP ${res.status}`);
  }
  throw new ApiError('http_error', `HTTP ${res.status}`);
}
```

This is a behavior change. Audit every caller for endpoints that return a non-2xx status with a usable body. Add tests for 401, 404, and 500 before merging.

**Acceptance.** A 500 from WordPress can no longer be returned as if it were data. Existing error messages still reach forms.

## 15. Unused or parallel code

Do one cleanup change with no feature work:

- Delete `/api/product-filters` if no external consumer uses it, or document it as a public endpoint.
- Delete `src/lib/api/user.ts` or fill it with the profile functions from item 9.
- Delete `useDebounce.ts` or use it in the header search.
- Delete `OrdersList.tsx` (Account uses `Orders`) and `TestimonialCarousel` / `NewsletterSection` / `InstagramSection` if they are not planned for the home page.
- Remove the `PromoBanners` import from the home page.
- Fix the product page comment: the product and rating fetch are sequential because the aggregate needs the product ID. Either update the comment or leave the sequence and stop claiming parallelism.

**Acceptance.** No unused exports that a reader would assume are live. `npm run lint` warnings drop.

## 16. Dark mode unwired

Choose one:

- **Remove it.** Delete the `.dark` block and any `dark:` utilities. This is honest and small.
- **Wire it.** Add a theme toggle that sets `.dark` on `<html>`, persist the choice, audit contrast on product, cart, checkout, and account pages, and add E2E snapshots. This is a feature, not cleanup.

Do not leave a half-working dark palette.

**Acceptance.** Either no dark styles exist, or the toggle works on every page without contrast failures.

## 17. No server route guard

There is no middleware. Client pages redirect after hydration.

If you add a guard, make it a presence check, not a security boundary:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const hasSession =
    request.cookies.has('refresh_token') || request.cookies.has('session_hint');
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}
export const config = { matcher: ['/account/:path*', '/checkout'] };
```

WordPress still authorizes every data request. Update this only after item 1, or the guard will redirect users whose session could have been refreshed.

**Acceptance.** A visitor with no session cookie reaches `/login` without a flash of account content. A signed-in user with an expired access token is not locked out before refresh can run.

## 18. `CodeDocs.md` stale

Done. The file has a legacy banner and points at `docs/`. Keep it for history; do not update it feature by feature.

## 19. Empty escaped directories

They are untracked and empty. Remove them:

```bash
rmdir 'src/app/\(shop\)/products/\[slug\]' \
      'src/app/\(shop\)/products' \
      'src/app/\(shop\)' \
      'src/app/order-confirmation/\[id\]'
```

Confirm with `git status` that nothing tracked disappeared. This is a working-copy cleanup only.

## 20. No error reporting

Add one service, not several.

- Create a Sentry project and install `@sentry/nextjs`.
- Add `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` or use the wizard.
- Set `SENTRY_DSN` and the auth token in the deployment environment, never in `NEXT_PUBLIC_*`.
- Report from `src/app/error.tsx` with `Sentry.captureException(error)`.
- Scrub tokens and email addresses with `beforeSend`.
- Add a release name from the deployment commit.

**Acceptance.** A thrown error in production appears in Sentry with a stack trace and release, and no auth token or customer email is attached.

---

## Verification for every change

1. `npx tsc --noEmit` passes.
2. `npm run lint` does not add errors.
3. `npm run build` passes for routing, data, or dependency changes.
4. The affected flow is tested manually in the states listed in [coding-standards.md](coding-standards.md#definition-of-done).
5. The matching section in [known-gaps.md](known-gaps.md) is removed or updated.
6. The flow doc in `docs/flows/` is updated if behavior changed.
