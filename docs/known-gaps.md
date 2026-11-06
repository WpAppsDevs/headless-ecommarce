# Known gaps

These are current behaviors, not aspirations. Each entry says what happens, where, and what would close it. Backend gaps need WordPress work; the frontend should not pretend they work.

For the completed remediation history and the exact changes, see [fix-plan.md](fix-plan.md).

## 1. Guest checkout needs WordPress support

Guest checkout is not implemented. `/checkout` requires a signed-in user and `src/proxy.ts` sends visitors without a session to `/login`. The old `config.features.guestCheckout` flag was removed because no code implemented it.

Closing this needs a WordPress endpoint that creates an order without a user and returns a confirmation key that can be looked up without an account. Do not implement it only in the client; unattributed orders cannot be supported.

- Where: `src/app/checkout/page.tsx`, `src/app/api/checkout/route.ts`, WordPress.
- Impact: medium. The store is account-only by design today.

## 2. Profile, password, and address changes are read-only

The account Setting tab shows name, email, phone, and account ID. The address tab shows billing and shipping. Neither can save changes.

WordPress exposes `GET /api/user` but the client has no update endpoint. Editing was removed rather than leaving a form that fakes a save.

Closing this needs WordPress endpoints for profile update and password change, plus a client route and `updateProfile` function. Address editing can use the same profile update payload.

- Where: `src/components/account/Settings.tsx`, `src/components/account/Address.tsx`, WordPress.
- Impact: medium. Customers contact support for changes.

## 3. Order cancellation has no endpoint

The Cancel Order button was removed. No WordPress endpoint accepts a cancellation, and the client cannot change an order status safely.

Closing this needs `POST /api/orders/:id/cancel` with ownership and status checks, a client proxy, and a confirmation dialog. Only show the action for cancellable statuses returned by the server.

- Where: `src/components/account/OrderCard.tsx`, WordPress.
- Impact: medium.

## 4. Review deletion has no ownership flag

`DELETE /api/reviews/:id` exists in the client layer, but the review payload does not say whether the current user owns the review. No delete control is shown, so there is no broken button.

Closing this needs a `can_delete` boolean or author user ID in the review response, then a delete action gated on that flag.

- Where: `src/lib/api/reviews.ts`, `src/components/reviews/ReviewCard.tsx`, WordPress.
- Impact: low.

## 5. Confirmation has no single-order endpoint

Order confirmation now keeps the checkout result in `sessionStorage` and falls back to scanning the 100 most recent orders for a signed-in user. An order older than that, viewed in a new tab, still cannot be recovered.

Closing this needs `GET /api/orders/:id` (or a signed guest confirmation endpoint) and a client proxy. The page would then fetch by ID first and use `sessionStorage` only for the payment reference.

- Where: `src/app/order-confirmation/[id]/page.tsx`, WordPress.
- Impact: low to medium. Direct visits to old confirmations lose status details.

## 6. Checkout-draft filtering is a backstop in the UI

`filterCheckoutDrafts` runs at the orders API boundary and again in `Dashboard` and `Orders`. Tracking has its own draft check in `normalizeTrackingResult`. The duplication is intentional so a new order surface cannot leak a draft, but only the pure filter has a unit test.

Closing this means either documenting the backstop as policy and adding a test per surface, or trusting the API boundary and removing the UI filters. Do not remove them without a test that the boundary still filters after pagination adjustment.

- Where: `src/lib/api/orders.ts`, `src/lib/order-utils.ts` consumers, `src/lib/api/tracking.ts`.
- Impact: low.

## 7. Error reports need a destination

Client errors go to `/api/errors`, which writes them to the server log and optionally forwards them to `ERROR_REPORT_WEBHOOK_URL`. Without that variable, reports are only as visible as the hosting provider's function logs.

Closing this operationally means setting the webhook to a collector or chat channel. A dedicated service such as Sentry would add release tracking and source maps, but is not required to see errors.

- Where: `src/app/api/errors/route.ts`, `docs/operations.md`.
- Impact: low.

## 8. Browser flows have no automated test

Vitest covers pure logic: order filtering, tracking normalization, currency formatting, shipping fallback, and the session-hint predicate. Checkout, auth reload, cart merge, tracking, and reviews are still verified manually.

Closing this needs an end-to-end runner against a seeded staging WordPress site. Keep it separate from the unit suite.

- Where: `vitest.config.ts`, `src/**/*.test.ts`.
- Impact: medium for regressions in money and identity flows.

## 9. Dark-mode utilities remain dormant

The `.dark` token block was removed and no toggle applies the class. Some shadcn primitives still carry `dark:` utilities, which only activate under a `.dark` ancestor, so they are inert.

Closing this means either deleting those utilities or implementing a real theme toggle and auditing contrast. Do not re-add the token block without the toggle.

- Where: `src/app/globals.css`, `src/components/ui/*`.
- Impact: low.

## 10. `CodeDocs.md` is historical

The root `CodeDocs.md` predates this documentation set. It carries a legacy banner and is kept for history. `docs/` is the maintained reference. `ApiDocs.md` remains an upstream contract reference; verify it against the live API before relying on it.

## How to use this list

Pick one item per change. Do not fold a refactor into a feature unless the feature requires it. When a gap closes, remove it here and update the affected flow doc in the same commit.
