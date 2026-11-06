# Routing and pages

## Route map

| URL | File | Rendering | Auth |
| --- | --- | --- | --- |
| `/` | `src/app/(shop)/page.tsx` | Server, ISR 60 s | Public |
| `/products` | `src/app/(shop)/products/page.tsx` | Server, ISR 60 s | Public |
| `/products/[slug]` | `src/app/(shop)/products/[slug]/page.tsx` | Server, ISR 60 s | Public |
| `/cart` | `src/app/cart/page.tsx` | Static shell + client content | Public |
| `/checkout` | `src/app/checkout/page.tsx` | Client | Required |
| `/account` | `src/app/account/page.tsx` | Client | Required |
| `/login` | `src/app/login/page.tsx` | Static shell + client form | Public |
| `/register` | `src/app/register/page.tsx` | Static shell + client form | Public |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Static shell | Public |
| `/reset-password` | `src/app/reset-password/page.tsx` | Static shell | Public |
| `/order-confirmation/[id]` | `src/app/order-confirmation/[id]/page.tsx` | Client | Public (assumes checkout context) |
| `/track-order` | `src/app/track-order/page.tsx` | Client | Public, richer when signed in |
| `/wishlist` | `src/app/(shop)/wishlist/page.tsx` | Server redirect | Public |
| `/shipping` | `src/app/shipping/page.tsx` | Static | Public |
| `/returns` | `src/app/returns/page.tsx` | Static | Public |
| `/privacy-policy` | `src/app/privacy-policy/page.tsx` | Static | Public |
| `/terms` | `src/app/terms/page.tsx` | Static | Public |

There are no `/contact`, `/about`, `/faq`, or `/collections` pages. The header fallback links to `/contact`, but the route does not exist. The WordPress menu can replace the fallback links at runtime.

## Root layout

`src/app/layout.tsx` runs for every page:

1. Loads Geist, Geist Mono, Playfair Display, and Inter through `next/font/google`.
2. Fetches the `primary` WordPress menu with `getMenuByLocation`.
3. Renders, in order: `AuthHydrator`, `CartHydrator`, `WishlistHydrator`, `CurrencyHydrator`, `AnnouncementBar`, `Header`, `CartDrawer`, `Toaster`, `main`, `Footer`.

`getMenuByLocation` never throws and returns `[]` on failure. The header then uses its static links. That means a WordPress outage degrades navigation instead of breaking the layout.

The layout is a Server Component but the header is a Client Component. `navLinks` is serialized across the boundary.

## Home page

`src/app/(shop)/page.tsx` composes sections in this order:

`HeroSlider` → `CategoryBanners` → `CategoryGrid` → `PreOrderSteps` → featured products → `WholesaleBanner` → `TestimonialsSection` → `ComingSoonSection` → `FeaturesStrip` → `WhatsAppCTA`.

The featured grid is an async RSC inside `<Suspense>`. It fetches four products and renders nothing if the request fails. The rest of the page is static markup, so the hero and marketing sections remain visible while products load.

## Shop page

`src/app/(shop)/products/page.tsx` reads `page`, `category`, `search`, `tag`, and `brand` from `searchParams`. It clamps the page to at least 1 and trims the other values.

It fetches products and filters in parallel with `Promise.all`. Both promises catch and fall back to empty data. A failed API call therefore renders an empty shop, not an error page.

`ShopClient` receives the initial data and owns:

- client-side price filtering and sorting over the current server page,
- color and size filters from `filters.colorTerms` and `filters.sizeTerms`,
- grid density (2, 3, or 4 columns),
- mobile filter drawer,
- pagination links that preserve the query string.

Category, tag, brand, and search are server-side filters. Price, color, and size are client-side filters on the current page only. The result count in `ShopTopBar` reflects this difference: it shows the server total and the filtered total separately.

Pagination is a full navigation. Client-side filter state resets when the page changes.

## Product page

`src/app/(shop)/products/[slug]/page.tsx`:

1. `generateStaticParams()` fetches every product slug. It returns `[]` when `NEXT_PUBLIC_WP_URL` is missing.
2. `generateMetadata()` fetches the product and uses its name and stripped short description.
3. The page fetches the product. `product_not_found` becomes `notFound()`; every other error is rethrown to the global error boundary.
4. It then fetches the rating aggregate. The comment says "in parallel", but the code awaits the product first. Treat it as sequential unless you refactor it.
5. If the aggregate has reviews, it emits Product JSON-LD with `aggregateRating`.
6. It renders `PageHeader`, a two-column gallery and info block, `ProductTabs`, and `RelatedProducts` inside `<Suspense>`.

`VariationSelector` handles simple and variable products:

- Attribute values come from the variation objects, not from `ProductAttribute.options`.
- Color attributes are detected by name (`color` or `colour`) and rendered as swatches; other attributes render as buttons.
- An option is disabled when every matching variation is out of stock.
- Quantity, add-to-cart, error messages, and a mobile sticky bar live here.
- The sticky bar appears when the main action row scrolls out of view, using `IntersectionObserver`.

`ProductTabs` is an accordion, not tabs: Product Details, Additional Info, Shipping & Returns, Reviews. The `#reviews` hash opens the reviews panel. Shipping copy in this accordion is hardcoded and does not match the Bengali shipping policy page.

## Cart

`src/app/cart/page.tsx` renders `PageHeader` and `CartPageContent`.

`CartHydrator` fetches on layout mount. `CartPageContent` retries only when the store has no items, no `lastFetchedAt`, and no request in flight, so opening `/cart` does not duplicate the GET.

Coupons, free shipping, and cart expiry are not implemented. Their UI was removed instead of leaving controls that do nothing. `CartSummary` reads the store's shipping methods and shows the same prices checkout uses; the customer picks a method at checkout.

## Checkout

`src/app/checkout/page.tsx` is a client page with an initialization gate:

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

`src/app/order-confirmation/[id]/page.tsx` reads `sessionStorage['order_<id>']`, which the checkout form writes before redirecting. The value stays in the tab, so a refresh keeps the status and payment reference.

When the stored result is missing, the page waits for auth hydration and, for a signed-in user, loads recent orders and finds the matching ID. WordPress remains the source of truth. If neither path finds the order, the page shows a next step instead of an empty heading.

The page shows a completed or pending state, the transaction ID when present, and BACS instructions when the order is pending without a transaction ID.

## Account

`src/app/account/page.tsx` waits for `authStore.hydrated`. If the user is not authenticated, it redirects to `/login`. Otherwise it fetches profile and up to 100 orders in parallel.

`AccountLayout` switches five tabs: Dashboard, Your Orders, Wishlist, My Address, Setting. `?tab=wishlist` selects the wishlist tab on first render; clicking tabs does not update the URL. The wishlist link in the header relies on this initial value.

Tab behavior:

- **Dashboard** — counts pending/processing/on-hold, cancelled, and total visible orders. Recent orders table.
- **Your Orders** — client-side filter tabs, five orders per page, order details modal, review action.
- **Wishlist** — fetches up to 100 products, shows removal and product links.
- **My Address** — displays billing and shipping from the profile, read-only until WordPress exposes an address update endpoint.
- **Setting** — read-only account summary (name, email, phone, account ID) with support channels for changes. No fake save action.

## Tracking

`/track-order` has a Bengali page title and a mixed-language body. Signed-in users look up one order by ID through `/api/tracking/order/:id`. Guests must supply an email and may optionally supply an order ID.

Results are accordions. The first five are shown; "Show more orders" reveals the rest. `checkout-draft` orders are filtered in the page and again in `normalizeTrackingResult()`.

The normalizer accepts three backend shapes:

- an array of `{ order, tracking, timeline }` entries,
- a single `{ order, tracking, timeline }` object,
- `{ orders: [...], tracking, timeline }`, where the shared tracking belongs to the newest order.

For older orders in the third shape, the timeline is reduced to an "Order Placed" event from `created_at`.

## Policy pages

`/shipping`, `/returns`, `/privacy-policy`, and `/terms` are static Bengali pages. They share `SectionHeading`, `Card`, `StatCard`, `NoteCallout`, `TypePanel`, and `BulletList` from `src/components/policies/PolicyUI.tsx`.

The product page's Shipping & Returns accordion summarizes the rules and links to `/shipping` and `/returns`, so the policy pages remain the single source of truth.

## Route protection

`src/proxy.ts` (Next.js 16's middleware replacement) guards `/account/:path*` and `/checkout`. It checks for the presence of `refresh_token` or `session_hint` and redirects to `/login?redirect=<path>` when both are absent.

This is a shell guard, not an authorization boundary. WordPress still authorizes every data request. Because the check is presence-only, a user with an expired refresh token reaches the page and is redirected by the client after the refresh attempt fails.

## Error and empty states

- Global error boundary: `src/app/error.tsx`, which reports through `reportError()` to `/api/errors`.
- Uncaught window errors and unhandled rejections: `src/components/layout/ErrorReporter.tsx`.
- 404: `src/app/not-found.tsx`.
- Product 404: `notFound()` for `product_not_found`.
- Empty shop: `ShopClient` empty state with "Clear all filters".
- Empty cart: drawer and page have separate empty states.
- Empty orders, wishlist, reviews, and tracking results all have dedicated states.

## Related

- [components.md](components.md)
- [data-layer.md](data-layer.md)
- [flows/cart-and-checkout.md](flows/cart-and-checkout.md)
