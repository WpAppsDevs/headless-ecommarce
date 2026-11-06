# Project structure

```
.
├── src/
│   ├── app/                  routes, layouts, and route handlers
│   ├── components/           UI grouped by domain
│   ├── lib/                  API clients, config, formatting, utilities
│   └── stores/               Zustand stores
├── public/images/            local marketing imagery
├── docs/                     maintained documentation (this folder)
├── promptcmd/                design and feature briefs, not runtime code
├── .design/                  reference screenshots, not runtime code
├── .commandcode/             agent preferences, not runtime code
├── ApiDocs.md                upstream wrapper API contract (can drift)
├── CodeDocs.md               older code documentation (superseded by docs/)
└── package.json              scripts and dependencies
```

## `src/app`

The App Router tree. Folders in parentheses are route groups: they organize files without changing the URL.

| Path | Route | Kind |
| --- | --- | --- |
| `(shop)/page.tsx` | `/` | Server page, ISR |
| `(shop)/products/page.tsx` | `/products` | Server page, ISR |
| `(shop)/products/[slug]/page.tsx` | `/products/:slug` | Server page, ISR |
| `(shop)/wishlist/page.tsx` | `/wishlist` | Redirects to `/account?tab=wishlist` |
| `account/page.tsx` | `/account` | Client page |
| `cart/page.tsx` | `/cart` | Static shell, client content |
| `checkout/page.tsx` | `/checkout` | Client page |
| `login/page.tsx` | `/login` | Static shell, client form |
| `register/page.tsx` | `/register` | Static shell, client form |
| `forgot-password/page.tsx` | `/forgot-password` | Static shell |
| `reset-password/page.tsx` | `/reset-password` | Static shell |
| `order-confirmation/[id]/page.tsx` | `/order-confirmation/:id` | Client page |
| `track-order/page.tsx` | `/track-order` | Client page |
| `shipping/page.tsx` | `/shipping` | Static policy page, Bengali |
| `returns/page.tsx` | `/returns` | Static policy page, Bengali |
| `privacy-policy/page.tsx` | `/privacy-policy` | Static policy page, Bengali |
| `terms/page.tsx` | `/terms` | Static policy page, Bengali |
| `api/**/route.ts` | `/api/*` | Route handlers |
| `layout.tsx` | — | Root layout: fonts, metadata, hydrators, chrome |
| `globals.css` | — | Tailwind import, brand tokens, base styles |
| `error.tsx` | — | Global error boundary |
| `not-found.tsx` | — | 404 page |

`layout.tsx` is an async Server Component because it fetches the primary menu. Every page renders inside it, so the header, footer, announcement bar, cart drawer, and toaster are global.

## `src/components`

Components are grouped by the domain they serve, not by atomic-design level.

| Folder | Purpose | Notes |
| --- | --- | --- |
| `layout/` | Header, footer, hydrators, newsletter form | Hydrators are invisible client components. |
| `home/` | Home page sections | Most are static; `HeroSlider` and `TestimonialsSection` have behavior. |
| `shop/` | Shop shell, sidebar, sort bar | `ShopClient` owns client-side filtering and view state. |
| `product/` | Product card, gallery, variation selector, tabs, related grid | `ProductTabs` contains the review tab. |
| `cart/` | Drawer, page content, line items, summary | `CartDrawer` and `CartPageContent` duplicate some chrome intentionally. |
| `checkout/` | Checkout form, Stripe element, BACS instructions | `CheckoutForm` is the largest component in the repo. |
| `account/` | Account shell, dashboard, orders, address, settings, wishlist | `AccountLayout` switches tabs. |
| `auth/` | Login, register, forgot, reset forms | Forms use react-hook-form and zod. |
| `reviews/` | Review list, card, summary, form, upload, filters | `ProductReviewsSection` is the entry point. |
| `review-modal/` | Review modal wrapper | Used by both product page and order card. |
| `tracking/` | Track form, accordion, timeline, status | Accordion and timeline are separate for reuse. |
| `policies/` | Shared policy-page primitives | `PolicyUI.tsx` is the only file. |
| `wishlist/` | Heart toggle | Used on cards and product detail. |
| `ui/` | shadcn/base-nova primitives | Button, card, input, label, badge, sheet, skeleton, PageHeader. |

Naming: PascalCase files for components, one exported component per file. Hooks are `useX.ts`. Utility modules are camelCase.

## `src/lib`

| Path | Responsibility |
| --- | --- |
| `config.ts` | Reads environment variables once, exposes `config`. |
| `errors.ts` | `ApiError`. |
| `utils.ts` | `cn()` for class merging. |
| `order-utils.ts` | `checkout-draft` filtering. |
| `auth-session.ts` | Session-hint predicate used by auth hydration. |
| `report-error.ts` | Client error reporter used by the error boundary and window listeners. |
| `utils/currency.ts` | `useFormatPrice()` and the formatter behind it. |
| `api/client.ts` | Shared fetch client, token cache, refresh, 401 handling. |
| `api/products.ts` | Product types and normalization. |
| `api/cart.ts` | Cart endpoints and shipping fallback. |
| `api/checkout.ts` | Profile, checkout, countries. |
| `api/orders.ts` | Order history plus draft filtering. |
| `api/reviews.ts` | Review reads and authenticated mutations. |
| `api/tracking.ts` | Tracking shape normalization. |
| `api/wishlist.ts` | Wishlist proxy calls and product normalization. |
| `api/filters.ts` | Shop filter data, parallel fetch, safe fallbacks. |
| `api/menus.ts` | WordPress menu location → `NavLink[]`. |
| `api/cart.test.ts`, `api/tracking.test.ts` | Colocated Vitest tests for normalizers and fallbacks. |

Files in `api/` may run on the server, the client, or both. The `typeof window !== 'undefined'` checks are deliberate: the same function chooses a proxy in the browser and a direct URL on the server. Do not remove them without replacing the CORS strategy.

## `src/stores`

| Store | Owns | Persistence |
| --- | --- | --- |
| `authStore` | user, `isAuthenticated`, `loading`, `hydrated` | Access token in `tokenCache`; refresh token in cookie |
| `cartStore` | items, cart token, shipping methods, drawer state | Guest token in `localStorage['cart_token']` |
| `wishlistStore` | product IDs, count, pending IDs | Guest IDs in `localStorage['wishlist_ids']` |
| `reviewStore` | product IDs reviewed in this session | Memory only |
| `currencyStore` | code, symbol, position, separators | Memory only; hydrated from store settings |

Stores import API functions and other stores. `authStore` calls into cart, wishlist, and review stores on login and logout. That dependency direction is one-way: cart and wishlist do not import auth.

## Route handlers

`src/app/api/` mirrors the remote namespaces but does not copy every endpoint.

```
api/
├── account/orders/
├── auth/{login,logout,me,refresh,register,forgot-password,reset-password}/
├── checkout/
├── errors/
├── newsletter/
├── reviews/{create,media/upload,product/[product_id],aggregate/[product_id],random,[review_id]}/
├── store-settings/
├── tracking/{search,order/[orderId]}/
└── wishlist/{,[id],check/[id]}/
```

Three handler patterns:

1. **Pure proxy** — forward method, body, auth header, and response. Most handlers.
2. **Cookie handler** — stores tokens in httpOnly cookies and reshapes the response. Auth routes. This includes the readable `session_hint` companion cookie.
3. **Normalizing proxy** — filters or repairs data before returning it. `/api/account/orders` is the one example.

The route guard is `src/proxy.ts` at the project root, not under `src/app/api/`. It is Next.js 16's middleware replacement.

## Non-runtime directories

- `promptcmd/` — briefs and prompts used during development. Useful history, not part of the build.
- `.design/` — reference screenshots and design targets.
- `.commandcode/` — agent taste and permission settings.
- `.gemini/`, `.taskmaster/` — tooling configuration. Not imported by the app.
- `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` — generated. Never edit.

## Where to put a new file

| You are adding… | Put it in… |
| --- | --- |
| A page | `src/app/<route>/page.tsx` |
| A route handler | `src/app/api/<domain>/route.ts` |
| A domain component | The matching folder under `src/components/` |
| A reusable primitive | `src/components/ui/` only if it is generic |
| A remote call | `src/lib/api/<domain>.ts` |
| Cross-component client state | `src/stores/<domain>Store.ts` |
| A pure helper | `src/lib/` |
| A hook used by more than one component | `src/hooks/` (create it when the first shared hook appears) |
