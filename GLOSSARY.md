# Glossary

Terms used across this storefront, the WordPress wrapper API, and the docs in `docs/`.

## Storefront

**Headless storefront** — this Next.js app. It renders the shop and talks to WordPress over HTTP; WordPress does not render these pages.

**Wrapper API** — the WordPress plugin that exposes WooCommerce data under `/wp-json`. Two namespaces matter:
- `wpadhlwrapi/v1` — catalog, cart, reviews, tracking, menus, store settings. Base is `config.productsNs`.
- `api` — auth, user profile, checkout, orders. Base is `config.apiNs`.

**Storefront checkout** — a checkout session where the browser collects addresses and chooses a gateway. The order is created by WordPress through `POST /wp-json/api/checkout`.

**Staging checkout** — this working copy at `Local Sites/headlessecf/app/public`. It points at a WordPress site through `NEXT_PUBLIC_WP_URL`. The WordPress install is a separate repository and is not covered by these docs.

**ISR** — Incremental Static Regeneration. Pages export `revalidate = 60` or call `fetch(..., { next: { revalidate } })` so a cached page refreshes in the background.

**RSC** — React Server Component. A component with no `'use client'` directive that runs on the server and can read the API directly.

**Hydration** — the client-side pass that restores a Zustand store after a page load. `AuthHydrator`, `CartHydrator`, `WishlistHydrator`, and `CurrencyHydrator` each run one hydration function inside a `useEffect`.

**Hydrator** — a client component that renders nothing and calls one store's hydration action once per page load.

## Identity and sessions

**Access token** — short-lived JWT returned by WordPress. It lives in module memory in `src/lib/api/client.ts` (`tokenCache`) and in an httpOnly `access_token` cookie. Client code sends it as `Authorization: Bearer <token>`.

**Refresh token** — 14-day token stored in the httpOnly `refresh_token` cookie. `POST /api/auth/refresh` exchanges it for a new access token.

**Token cache** — the module-scoped variable behind `tokenCache`. It is not persisted. On a reload, `authStore.hydrate()` can recover an access token through the refresh flow, but only when it sees a guest cart token or a cached token first; see [known-gaps.md](docs/known-gaps.md).

**Guest cart token** — a JWT returned only on the first successful add for a new guest session. It is stored in `localStorage['cart_token']` and sent as the bearer token for guest cart calls. It is not the same thing as the **cart token**.

**Cart token** — a UUID identifying the cart row. It is returned as `cart_token` by every cart endpoint and is not an auth credential.

**`cart_token`** — the localStorage key that holds the guest cart JWT. The name collides with the cart UUID above; read the context.

**Session expiry** — a 401 that survives one refresh attempt. The API client calls the callback registered by `authStore`, clears both stores, and redirects to `/login` only if a real user session existed.

## Catalog

**Product** — a WooCommerce product, normalized in `src/lib/api/products.ts` to `Product`.

**Variable product** — a product with variations. Its attributes (`pa_color`, `pa_size`, …) select a **variation**.

**Variation** — a concrete SKU with its own price, stock status, and image. The API returns variation IDs in list responses and full variation objects in detail responses; the client normalizes both.

**Attribute slug** — the key used for variation matching, for example `pa_color`. `ProductAttribute` carries the ID-to-slug map used to build `ProductVariation.attributes`.

**Filter set** — the categories, tags, brands, and `pa_color`/`pa_size` terms fetched by `getProductFilters()` for the shop sidebar.

**Checkout draft** — a WooCommerce order with status `checkout-draft`. These are incomplete records and are filtered out of every order-facing view by `src/lib/order-utils.ts`.

## Cart and orders

**Cart line** — one row in the cart API response (`CartItem`). IDs are strings in the API type but numeric in update/remove calls; callers convert.

**Shipping method** — an option returned by the cart API (`free_shipping`, `local_pickup`, `flat_rate`). `getShippingMethods()` falls back to hardcoded defaults when the API omits them.

**Order** — a WooCommerce order returned by `GET /wp-json/api/orders`, with line items, billing, shipping, totals, and refunds.

**BACS** — bank transfer. The default gateway in the checkout form. The order is created as pending and payment details arrive by email.

**Stripe gateway** — card payment. `StripeForm` creates a PaymentMethod in the browser; `CheckoutForm` sends its ID to `/api/checkout` as `payment_data.payment_method_id`.

**Order confirmation** — `/order-confirmation/[id]`. It reads a small `OrderResult` from `sessionStorage` (`order_<id>`) because the order page does not fetch the order again.

## Reviews

**Review** — a product review with rating, title, content, author, optional media, and moderation status (`pending`, `approved`, `rejected`).

**Review aggregate** — rating total, average, and per-star distribution for one product, used by the rating summary and JSON-LD.

**Review eligibility** — the rules that decide whether the "Write Review" action appears on an order card: the order is paid (`completed` or `processing`), it is not fully refunded, and the product has not already been reviewed in this session.

## Tracking

**Tracking entry** — one order plus its carrier info and timeline. `normalizeTrackingResult()` accepts three backend response shapes and always returns `{ entries: TrackingOrderEntry[] }`.

**Tracking timeline** — ordered shipping events. If the backend returns no events, the normalizer builds an "Order Placed" event from `order.created_at`.

## State and data

**Store** — a Zustand store in `src/stores/`. There is one store per domain: auth, cart, wishlist, reviews, currency.

**Proxy route** — a Next.js route handler under `src/app/api/` that forwards a request to WordPress. It exists for CORS, cookie handling, caching, or response normalization.

**Direct call** — a browser `fetch` to the WordPress base URL that bypasses a proxy. Catalog reads and cart writes currently use this path.

**Optimistic update** — the store changes local state before the network call resolves, then reconciles or rolls back. Cart add and wishlist toggle use it.

## Design

**Brand token** — a CSS variable in `src/app/globals.css` (`--brand-accent`, `--brand-text`, …) exposed as a Tailwind utility (`bg-brand-accent`). Change the token, not the component.

**Design variant** — the project mixes two visual languages: the maroon/cream product-detail style (`#9E2F45`, `#1F2A3C`, Playfair) and the shadcn base-nova style used by auth and account pages. Docs call out which one a screen follows.
