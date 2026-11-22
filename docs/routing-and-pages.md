# Routing and pages

## Route map

| URL | File | Rendering | Auth |
| --- | --- | --- | --- |
| `/` | `src/app/(storefront)/(shop)/page.tsx` | Server, ISR 60 s | Public |
| `/products` | `src/app/(storefront)/(shop)/products/page.tsx` | Server, ISR 60 s | Public |
| `/products/[slug]` | `src/app/(storefront)/(shop)/products/[slug]/page.tsx` | Server, ISR 60 s | Public |
| `/cart` | `src/app/(storefront)/cart/page.tsx` | Static shell + client content | Public |
| `/contact` | `src/app/(storefront)/contact/page.tsx` | Static | Public |
| `/checkout` | `src/app/(storefront)/checkout/page.tsx` | Client | Required |
| `/account` | `src/app/(storefront)/account/page.tsx` | Client | Required |
| `/login` | `src/app/(storefront)/login/page.tsx` | Static shell + client form | Public |
| `/register` | `src/app/(storefront)/register/page.tsx` | Static shell + client form | Public |
| `/forgot-password` | `src/app/(storefront)/forgot-password/page.tsx` | Static shell | Public |
| `/reset-password` | `src/app/(storefront)/reset-password/page.tsx` | Static shell | Public |
| `/order-confirmation/[id]` | `src/app/(storefront)/order-confirmation/[id]/page.tsx` | Client | Public (assumes checkout context) |
| `/track-order` | `src/app/(storefront)/track-order/page.tsx` | Client | Public, richer when signed in |
| `/wishlist` | `src/app/(storefront)/(shop)/wishlist/page.tsx` | Server redirect | Public |
| `/shipping` | `src/app/(storefront)/shipping/page.tsx` | Static | Public |
| `/returns` | `src/app/(storefront)/returns/page.tsx` | Static | Public |
| `/privacy-policy` | `src/app/(storefront)/privacy-policy/page.tsx` | Static | Public |
| `/terms` | `src/app/(storefront)/terms/page.tsx` | Static | Public |
| `/studio` | `src/app/(staff)/studio/page.tsx` | Client dashboard inside a server page | Staff |
| `/studio/login` | `src/app/(staff)/studio/login/page.tsx` | Server redirect → `/login?redirect=/studio` | Public |
| `/studio/products` | `src/app/(staff)/studio/products/page.tsx` | Client shell inside a server page | Staff |
| `/studio/products/new` | `src/app/(staff)/studio/products/new/page.tsx` | Client form inside a server page | Staff |
| `/studio/products/[id]/edit` | `src/app/(staff)/studio/products/[id]/edit/page.tsx` | Client form inside a server page | Staff |

There are no `/about`, `/faq`, or `/collections` pages. The header fallback includes `/contact`, which resolves to the static support page. The WordPress menu can replace the fallback links at runtime.

## Layouts

There is one root layout and two surface layouts. A page lives in exactly one
route group, so it inherits exactly one of them.

**`src/app/layout.tsx` — the document shell.** Runs for every page:

1. Loads Geist, Geist Mono, Playfair Display, and Inter through `next/font/google`.
2. Reads the `locale` cookie and provides it through `LocaleProvider`.
3. Renders `AuthHydrator`, `CartHydrator`, `WishlistHydrator`, `CurrencyHydrator`, `ErrorReporter` and `Toaster`.

It owns `<html>`, `<body>` and nothing else visual.

**`src/app/(storefront)/layout.tsx` — the shop.** Fetches the `primary` WordPress menu with `getMenuByLocation`, then renders the skip link, `AnnouncementBar`, `Header`, `CartDrawer`, `<main id="main">` and `Footer`. Every public page — home, catalog, cart, checkout, account, auth, policies, tracking, the dev preview — lives under `(storefront)/`.

**`src/app/(staff)/layout.tsx` — the staff surface.** It keeps the shop's frame: `StudioHeader` (wordmark, language switch and a staff-shaped account menu — no menu, search, cart or wishlist icons) and the shop's `Footer` unchanged. The `/studio` dashboard lives inside and brings its own shell; the shell's canvas, identity card and navigation are the same component the account dashboard uses (`src/components/dashboard/DashboardShell.tsx`).

`getMenuByLocation` never throws and returns `[]` on failure. The header then uses its static links. That means a WordPress outage degrades navigation instead of breaking the layout.

The layouts are Server Components but the header is a Client Component. `navLinks` is serialized across the boundary.

`src/app/not-found.tsx` remains at the root for URLs that match no route; `(storefront)/not-found.tsx` re-exports it so an in-app `notFound()` (a missing product) keeps the storefront chrome.

## Home page

`src/app/(storefront)/(shop)/page.tsx` composes sections in this order:

`HeroSlider` → `CategoryBanners` → `CategoryGrid` → `PreOrderSteps` → featured products → `WholesaleBanner` → `TestimonialsSection` → `ComingSoonSection` → `FeaturesStrip` → `WhatsAppCTA`.

The home page makes one bounded catalogue request (up to 100 products) and passes the availability mode and featured products down; there is no separate hero or featured fetch. The hero mode is Ready Stock when stock exists, Pre-Order when only pre-order products exist, and contact when both are empty. If the catalogue request fails, the featured grid is empty and the hero switches to contact rather than promising stock it could not verify.

## Shop page

`src/app/(storefront)/(shop)/products/page.tsx` reads `page`, `category`, `search`, `tag`, and `brand` from `searchParams`. It clamps the page to at least 1 and trims the other values.

It fetches products and filters in parallel with `Promise.all`. Both promises catch and fall back to empty data. A failed API call therefore renders an empty shop, not an error page.

The Ready Stock collection is the exception: its tag matches products whose stock lives per variation, so the page fetches the tagged set in one pass, drops sold-out products through the shared availability module, and paginates the result itself. All Products and category pages keep the server's pagination and still show sold-out products.

`ShopClient` receives the initial data and owns:

- client-side price filtering and sorting over the current server page,
- color and size filters from `filters.colorTerms` and `filters.sizeTerms`,
- grid density (2, 3, or 4 columns),
- mobile filter drawer,
- pagination links that preserve the query string.

Category, tag, brand, and search are server-side filters. Price, color, and size are client-side filters on the current page only. The result count in `ShopTopBar` reflects this difference: it shows the server total and the filtered total separately.

Clear all filters and All Products both reset every server-side filter and the client-side price, colour, and size state, then return to `/products`. The decision is in `clearShopFilters()` so it can be tested without a browser.

Pagination is a full navigation. Client-side filter state resets when the page changes.

## Product page

`src/app/(storefront)/(shop)/products/[slug]/page.tsx`:

1. `generateStaticParams()` fetches every product slug. It returns `[]` when `NEXT_PUBLIC_WP_URL` is missing.
2. `generateMetadata()` fetches the product and uses its name and stripped short description.
3. The page fetches the product. `product_not_found` becomes `notFound()`; every other error is rethrown to the global error boundary.
4. It then fetches the rating aggregate. This necessarily follows the product fetch because the aggregate needs the product ID.
5. If the aggregate has reviews, it emits Product JSON-LD with `aggregateRating`.
6. It renders `PageHeader`, a two-column gallery and info block, `ProductTabs`, and `RelatedProducts` inside `<Suspense>`.

`VariationSelector` handles simple and variable products:

- Attribute values come from the variation objects, not from `ProductAttribute.options`.
- Color attributes are detected by name (`color` or `colour`) and rendered as swatches; other attributes render as buttons.
- An option is disabled when every matching variation is out of stock, unless the product is a pre-order.
- Pre-Order is a purchase mode, so a pre-order product stays buyable even when its stock status is out of stock.
- A sold-out product shows Sold Out next to the price and hides the quantity and add controls. The mobile sticky bar is not rendered.
- Quantity, add-to-cart, error messages, and a mobile sticky bar live here.
- The sticky bar appears when the main action row scrolls out of view, using `IntersectionObserver`.

`ProductTabs` is an accordion, not tabs: Product Details, Additional Info, Shipping & Returns, Reviews. The `#reviews` hash opens the reviews panel. The Shipping & Returns panel summarizes the rules and links to `/shipping` and `/returns`, which are the source of truth.

## Cart

`src/app/cart/page.tsx` renders `PageHeader` and `CartPageContent`.

`CartHydrator` fetches on layout mount. `CartPageContent` retries only when the store has no items, no `lastFetchedAt`, and no request in flight, so opening `/cart` does not duplicate the GET.

Coupons, free shipping, and cart expiry are not implemented. Their UI was removed instead of leaving controls that do nothing. `CartSummary` reads the store's shipping methods and shows the same prices checkout uses; the customer picks a method at checkout.

## Checkout

`src/app/(storefront)/checkout/page.tsx` is a client page with an initialization gate:

1. `getUser()` loads the profile. `session_expired` or `invalid_token` redirects to `/login?redirect=/checkout`.
2. If no profile but a non-auth error occurred, the form renders without prefill.
3. If the cart is empty, it redirects to `/cart`.
4. Only then does it render `CheckoutForm`.

`CheckoutForm`:

- validates with zod and react-hook-form,
- loads countries and states from `getCountries()`,
- defaults the gateway to BACS,
- copies billing into shipping when "same as billing" is checked,
- uses the store's shipping methods, defaulting to the first one,
- re-fetches the cart immediately before placing the order,
- for Stripe, creates a PaymentMethod through `StripeForm` and sends its ID,
- races the order request against a 30-second timeout,
- on success clears the cart, writes `order_<id>` to `sessionStorage`, and navigates to the confirmation page.

Guest checkout is not implemented. The page requires a user token, and `src/proxy.ts` redirects visitors without a session to `/login`. The old feature flag was removed; treat the flow as account-only until WordPress supports guest orders.

## Order confirmation

`src/app/(storefront)/order-confirmation/[id]/page.tsx` reads `sessionStorage['order_<id>']`, which the checkout form writes before redirecting. The value stays in the tab, so a refresh keeps the status and payment reference.

When the stored result is missing, the page waits for auth hydration and, for a signed-in user, loads recent orders and finds the matching ID. WordPress remains the source of truth. If neither path finds the order, the page shows a next step instead of an empty heading.

The page shows a completed or pending state, the transaction ID when present, and BACS instructions when the order is pending without a transaction ID.

## Account

`src/app/(storefront)/account/page.tsx` waits for `authStore.hydrated` and redirects to `/login` when signed out. A signed-in visit is one round trip: `/api/auth/refresh` returns `{ token, profile }`, so the page reads the profile from the store instead of calling `/api/auth/me` again, and it fetches 25 orders alongside it (the Orders tab pages five at a time and the dashboard shows three).

`AccountLayout` switches four tabs over the shared `DashboardShell`: Dashboard, Your Orders, Wishlist, Settings. The tab lives in the URL (`?tab=orders`), written with `router.replace` so a refresh keeps it, Back returns to the previous tab, and a link can point at one tab. A pre-merge `?tab=address` link now lands on Settings.

Tab behavior:

- **Dashboard** — greeting with up to two initials, shortcuts to orders, saved items and support, the active order with its four-stage delivery progress (the pre-order window shows only before dispatch), active/delivered/total counts, the three most recent orders, and a wishlist link. Status colors come from `src/lib/order-status.ts`; no component defines its own palette.
- **Your Orders** — client-side filter tabs, five orders per page, order details modal, review action.
- **Wishlist** — saved products with removal and product links.
- **Settings** — the profile (name, email) and both addresses in one page, each editable inline through `PUT /api/account/profile` (the plugin's `PUT /user`). The password card changes the password in place through `POST /api/account/password` (the plugin's `POST /user/password`, which requires the current password and revokes older tokens); a forgotten password still has the `/forgot-password` link. Support channels sit below.

The desktop rail and the content panel share one height: the rail carries identity on top, the menu in the middle and sign-out at the bottom, while the content sits on `--brand-accent-light` so its white cards read as cards.

## Tracking

`/track-order` has a Bengali page title and a mixed-language body. Signed-in users look up one order by ID through `/api/tracking/order/:id`. Guests must supply an email and may optionally supply an order ID.

Results are accordions. The first five are shown; "Show more orders" reveals the rest. `checkout-draft` orders are filtered in the page and again in `normalizeTrackingResult()`.

The normalizer accepts three backend shapes:

- an array of `{ order, tracking, timeline }` entries,
- a single `{ order, tracking, timeline }` object,
- `{ orders: [...], tracking, timeline }`, where the shared tracking belongs to the newest order.

For older orders in the third shape, the timeline is reduced to an "Order Placed" event from `created_at`.

## Policy pages

`/shipping`, `/returns`, `/privacy-policy`, and `/terms` are bilingual and stay static content, not CMS content. Each route has a `page.tsx` that picks `content/Bn.tsx` or `content/En.tsx` from the locale cookie and exports `generateMetadata` from `pages.*` in the dictionary; the Bangla body is the original copy, the English one is its translation. They share `SectionHeading`, `Card`, `StatCard`, `NoteCallout`, `TypePanel`, and `BulletList` from one file each under `src/components/policies/`.

`/track-order` is a client page and takes its copy from `trackOrder` and `tracking.form` in the dictionary. Tracking results (`TrackingAccordion`, `TrackingStatus`, `TrackingTimeline`) stay English in both languages.

The product page's Shipping & Returns accordion summarizes the rules and links to `/shipping` and `/returns`, so the policy pages remain the single source of truth.

## Route protection

`src/proxy.ts` (Next.js 16's middleware replacement) guards `/account/:path*` and `/checkout`. It checks for the presence of `refresh_token` or `session_hint` and redirects to `/login?redirect=<path>` when both are absent.

This is a shell guard, not an authorization boundary. WordPress still authorizes every data request. Because the check is presence-only, a user with an expired refresh token reaches the page and is redirected by the client after the refresh attempt fails.

## Error and empty states

- Global error boundary: `src/app/error.tsx`, which reports through `reportError()` to `/api/errors`.
- Uncaught window errors and unhandled rejections: `src/components/layout/ErrorReporter.tsx`.
- 404: `src/app/not-found.tsx`.
- Product 404: `notFound()` for `product_not_found`.
- Empty shop: `ShopClient` shows one empty-state message with "Clear all filters".
- Empty cart: drawer and page have separate empty states.
- Empty orders, wishlist, reviews, and tracking results all have dedicated states.

## Related

- [components.md](components.md)
- [data-layer.md](data-layer.md)
- [flows/cart-and-checkout.md](flows/cart-and-checkout.md)
