# Known gaps

These are current behaviors, not aspirations. Each entry says what happens, where, and what would close it. Backend gaps need WordPress work; the frontend should not pretend they work.

## 1. Guest checkout needs WordPress support

Guest checkout is not implemented. `/checkout` requires a signed-in user and `src/proxy.ts` sends visitors without a session to `/login`. The old `config.features.guestCheckout` flag was removed because no code implemented it.

Closing this needs a WordPress endpoint that creates an order without a user and returns a confirmation key that can be looked up without an account. Implement it in WordPress so every order stays attributable.

- Where: `src/app/checkout/page.tsx`, `src/app/api/checkout/route.ts`, WordPress.
- Impact: medium. The store is account-only by design today.

## 2. Password changes go through the reset flow

Name, email and both addresses are editable in the account (the Setting tab and the Address tab save through `PUT /api/account/profile`). A password change still means the email reset flow: there is no authenticated "change my password" route in the plugin, so the Setting tab links to `/forgot-password` instead of showing a form with no endpoint behind it.

Closing this needs a `POST /api/auth/change-password` route that requires the current password, plus a client proxy and a form in `Settings.tsx`.

- Where: `src/components/account/Settings.tsx`, `src/app/api/account/profile/route.ts`, WordPress `api/auth`.
- Impact: low. Customers can already reset a password they control the email for.

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

Closing this means either documenting the backstop as policy and adding a test per surface, or trusting the API boundary and removing the UI filters. Keep them until a boundary test proves drafts stay filtered after pagination adjustment.

- Where: `src/lib/api/orders.ts`, `src/lib/order-utils.ts` consumers, `src/lib/api/tracking.ts`.
- Impact: low.

## 7. Error reports need a destination

Client errors go to `/api/errors`, which writes them to the server log and optionally forwards them to `ERROR_REPORT_WEBHOOK_URL`. Without that variable, reports are only as visible as the hosting provider's function logs.

Closing this operationally means setting the webhook to a collector or chat channel. A dedicated service such as Sentry would add release tracking and source maps, but is not required to see errors.

- Where: `src/app/api/errors/route.ts`, `docs/operations.md`.
- Impact: low.

## 8. Browser coverage stops short of checkout

Vitest covers pure logic, and `check:routes` covers language and metadata per route. Playwright (`npm run test:e2e`) now covers what sits behind a session: the account tabs, an order card and its modal, the language switch, Bangla typography, and keyboard entry.

Still uncovered: checkout validation, cart merge on sign-in, review submission, and tracking lookup. Checkout has a test written but it self-skips, because every product is currently sold out and no cart can be filled.

Closing this needs stock in WordPress, plus a seeded staging site so those flows do not depend on live data. Keep it separate from the unit suite.

- Where: `playwright.config.ts`, `e2e/*.spec.ts`, `vitest.config.ts`.
- Impact: medium for regressions in money and identity flows.

## 8b. Product content has no Bangla version

Product names, descriptions, brand names and review text arrive from WordPress in English, so a Bangla page shows Bangla chrome around English products. The front end cannot fix this: the API exposes no translated fields, and only `store.locale` (from `WPLANG`) is locale-aware.

Taxonomy labels are the exception — `src/i18n/taxonomy.ts` maps term slugs to Bangla (`women` → নারী), because a slug is an identifier rather than copy.

Closing this needs either WPML/Polylang, or a `translations` field plus endpoints in the headless wrapper plugin. The owner has deferred both. See [localization.md](localization.md).

- Where: WordPress (`wpappsdev-headless-wrapper-api`), `src/lib/api/products.ts`, `src/i18n/taxonomy.ts`.
- Impact: high for the Bangla experience, no frontend workaround.

## 9. Dark-mode utilities remain dormant

The `.dark` token block was removed and no toggle applies the class. Some shadcn primitives still carry `dark:` utilities, which only activate under a `.dark` ancestor, so they are inert.

Closing this means either deleting those utilities or implementing a real theme toggle and auditing contrast. Re-add the token block only with the toggle.

- Where: `src/app/globals.css`, `src/components/ui/*`.
- Impact: low.

## 10. `CodeDocs.md` is historical

The root `CodeDocs.md` predates this documentation set. It carries a legacy banner and is kept for history. `docs/` is the maintained reference. `ApiDocs.md` remains an upstream contract reference; verify it against the live API before relying on it.

## 11. Catalog collection is empty by decision

The Catalog / Wholesale navigation item and the home catalog links point at `/products?tag=catalog`, which currently returns no products. A product decision kept the links in place rather than removing them, so the destination remains a dead end until catalog products are tagged.

Closing this means tagging wholesale/catalog products with `catalog`, or pointing the links at a catalog asset once one exists. The navigation, hero, and wholesale section already treat catalog as a first-class purchase type, so the data is the only missing piece.

- Where: `src/components/layout/Header.tsx`, `src/components/home/CategoryGrid.tsx`, `src/components/home/WholesaleBanner.tsx`, `src/components/home/HeroSlider.tsx`, WordPress.
- Impact: high for wholesale buyers.

## How to use this list

Pick one item per change. Keep refactors out of feature work unless the feature needs them. When a gap closes, remove it here and update the affected flow doc in the same commit.
