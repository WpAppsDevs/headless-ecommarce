# REST API Audit — Headless ECF Frontend

> **Codebase:** Next.js 14 + Tailwind | **Backend:** WordPress/WooCommerce + Custom Plugin
> **Audit date:** 2026-04-29 | **Audited by:** GitHub Copilot

---

## Table of Contents

1. [Classification Summary](#classification-summary)
2. [A. WooCommerce REST API](#a-woocommerce-rest-api)
3. [B. WooCommerce Store API](#b-woocommerce-store-api)
4. [C. WordPress Default REST API](#c-wordpress-default-rest-api)
5. [D. Custom Plugin — `wpadhlwrapi/v1`](#d-custom-plugin--wpadhlwrapiv1)
6. [E. Custom Plugin — `api` namespace](#e-custom-plugin--api-namespace)
7. [F. Next.js Proxy Routes](#f-nextjs-proxy-routes)
8. [G. Data Flow](#g-data-flow)
9. [H. Token Architecture](#h-token-architecture)
10. [I. Unused but Expected APIs](#i-unused-but-expected-apis)
11. [J. Bug Found & Fixed](#j-bug-found--fixed)
12. [K. Summary](#k-summary)

---

## Classification Summary

| API Type | Endpoints Found |
|---|---|
| **A. WooCommerce REST API** (`/wc/v3/*`, `/wc/v2/*`) | **0** |
| **B. WooCommerce Store API** (`/wc/store/*`) | **0** |
| **C. WordPress Default REST API** (`/wp/v2/*`) | **0** |
| **D. Custom Plugin: `wpadhlwrapi/v1`** (Products & Cart) | **6** |
| **E. Custom Plugin: `api`** (Auth / User / Orders / Checkout) | **8** |
| **Total backend endpoints** | **14** |

**Architecture:** Hybrid — server-side calls go directly to WP; browser calls are proxied through 6 Next.js API route handlers to avoid CORS.

---

## A. WooCommerce REST API

> **NONE USED.** No calls to `/wp-json/wc/v3/*` or `/wp-json/wc/v2/*` anywhere in the codebase.

---

## B. WooCommerce Store API

> **NONE USED.** No calls to `/wp-json/wc/store/*` anywhere in the codebase.

---

## C. WordPress Default REST API

> **NONE USED.** No calls to `/wp-json/wp/v2/*` anywhere in the codebase.

---

## D. Custom Plugin — `wpadhlwrapi/v1`

> **Base URL:** `{NEXT_PUBLIC_WP_URL}/wp-json/wpadhlwrapi/v1`
> **Purpose:** Products catalog + Cart management
> **Call method:** Raw `fetch` (products) · `apiClient` (cart)

### D.1 — Products

```
GET  /wp-json/wpadhlwrapi/v1/products
     ?page=<n>&per_page=<n>&category=<slug>&search=<q>
```
- **Purpose:** Paginated product listing with optional filters
- **Used in:** `src/lib/api/products.ts` lines 96–100
- **Call type:** Server-side (Next.js RSC), ISR revalidation every 60 s
- **Callers:** `src/app/(shop)/page.tsx`, `src/app/products/page.tsx`, `src/components/product/RelatedProducts.tsx`

---

```
GET  /wp-json/wpadhlwrapi/v1/products/{slug}
```
- **Purpose:** Single product detail by slug
- **Used in:** `src/lib/api/products.ts` lines 103–109
- **Call type:** Server-side (Next.js RSC), ISR revalidation every 60 s
- **Callers:** `src/app/products/[slug]/page.tsx`

---

```
GET  /wp-json/wpadhlwrapi/v1/products
     (getAllProductSlugs — minimal fields, for static path generation)
```
- **Purpose:** Enumerate all slugs for `generateStaticParams`
- **Used in:** `src/lib/api/products.ts` lines 112–124
- **Call type:** Server-side at build/ISR, `next: { revalidate: 3600 }`

### D.2 — Cart

```
POST    /wp-json/wpadhlwrapi/v1/cart/add
```
- **Purpose:** Add item to cart (guest or authenticated)
- **Used in:** `src/lib/api/cart.ts` line 63
- **Call type:** Client-side via `apiClient`; passes `cart_token` header for guest sessions

---

```
GET     /wp-json/wpadhlwrapi/v1/cart
```
- **Purpose:** Fetch current cart contents
- **Used in:** `src/lib/api/cart.ts` line 77
- **Call type:** Client-side via `apiClient`

---

```
PUT     /wp-json/wpadhlwrapi/v1/cart/update
```
- **Purpose:** Update quantity of a cart line item
- **Used in:** `src/lib/api/cart.ts` line 87
- **Call type:** Client-side via `apiClient`

---

```
DELETE  /wp-json/wpadhlwrapi/v1/cart/remove
```
- **Purpose:** Remove a line item from cart
- **Used in:** `src/lib/api/cart.ts` line 97
- **Call type:** Client-side via `apiClient`

---

## E. Custom Plugin — `api` namespace

> **Base URL:** `{NEXT_PUBLIC_WP_URL}/wp-json/api`
> **Purpose:** Auth, User profile, Orders, Checkout, Password reset
> **Browser calls** proxy through Next.js route handlers; **server-side calls** WP directly.

### E.1 — Authentication

```
POST  /wp-json/api/auth/login
```
- **Purpose:** Authenticate user, receive `access_token` + `refresh_token`
- **WordPress endpoint called by:** `src/app/api/auth/login/route.ts` line 18
- **Browser call:** `POST /api/auth/login` → Next.js proxy → WordPress
- **Frontend caller:** `src/stores/authStore.ts` (`login()`)

---

```
POST  /wp-json/api/auth/register
```
- **Purpose:** Register new user, auto-login (returns tokens)
- **WordPress endpoint called by:** `src/app/api/auth/register/route.ts` line 17
- **Browser call:** `POST /api/auth/register` → Next.js proxy → WordPress
- **Frontend caller:** `src/stores/authStore.ts` (`register()`)

---

```
POST  /wp-json/api/auth/refresh
```
- **Purpose:** Exchange `refresh_token` for a new `access_token`
- **WordPress endpoint called by:** `src/app/api/auth/refresh/route.ts` line 32
- **Browser call:** `POST /api/auth/refresh` → Next.js proxy → WordPress
- **Frontend callers:** `src/lib/api/client.ts` (auto-retry on 401), `src/stores/authStore.ts`

---

```
POST  /wp-json/api/auth/forgot-password
```
- **Purpose:** Send password reset email to the provided address
- **Used in:** `src/components/auth/ForgotPasswordForm.tsx` line 29
- **Call type:** Client-side directly via `apiClient` (no Next.js proxy)
- **Note:** Response is always swallowed (anti-enumeration — always shows success)

---

```
POST  /wp-json/api/auth/reset-password
```
- **Purpose:** Validate reset key and set a new password
- **Used in:** `src/components/auth/ResetPasswordForm.tsx` line 47
- **Call type:** Client-side directly via `apiClient` (no Next.js proxy)
- **Payload:** `{ key, login, new_password }`

### E.2 — User Profile

```
GET   /wp-json/api/user
```
- **Purpose:** Fetch authenticated user's profile (name, email, billing/shipping addresses)
- **WordPress endpoint called by:**
  - `src/app/api/auth/me/route.ts` line 16 → browser path via proxy `GET /api/auth/me`
  - `src/lib/api/checkout.ts` line 74 → server-side direct call
- **Frontend callers:** `src/stores/authStore.ts` (`hydrate()`), `src/app/checkout/page.tsx`

### E.3 — Orders

```
GET   /wp-json/api/orders?page=<n>&per_page=<n>
```
- **Purpose:** Paginated order history for the authenticated user
- **WordPress endpoint called by:**
  - `src/app/api/account/orders/route.ts` line 20 → browser path via proxy `GET /api/account/orders`
  - `src/lib/api/orders.ts` line 83 → server-side direct call
- **Frontend callers:** `src/components/account/Orders.tsx` (via `getOrders()`), `src/app/order-confirmation/[id]/page.tsx`

### E.4 — Checkout

```
POST  /wp-json/api/checkout
```
- **Purpose:** Place order — accepts billing/shipping addresses, gateway, and optional Stripe payment data
- **Used in:** `src/lib/api/checkout.ts` line 79
- **Call type:** Client-side via `apiClient` (no Next.js proxy; requires `Authorization: Bearer <access_token>`)
- **Frontend caller:** `src/components/checkout/CheckoutForm.tsx`
- **Supported gateways:** `stripe`, `bacs`

---

## F. Next.js Proxy Routes

These routes exist solely to relay browser requests to WordPress for CORS isolation. No business logic — pure pass-through.

| Browser → Next.js | Method | Proxies to WordPress | Sets cookies? |
|---|---|---|---|
| `/api/auth/login` | POST | `/wp-json/api/auth/login` | ✅ `access_token`, `refresh_token` (httpOnly) |
| `/api/auth/register` | POST | `/wp-json/api/auth/register` | ✅ `access_token`, `refresh_token` (httpOnly) |
| `/api/auth/refresh` | POST | `/wp-json/api/auth/refresh` | ✅ overwrites `access_token` |
| `/api/auth/me` | GET | `/wp-json/api/user` | ❌ read-only |
| `/api/auth/logout` | POST | _(no WP call — cookie cleanup only)_ | ✅ clears both cookies |
| `/api/account/orders` | GET | `/wp-json/api/orders` | ❌ read-only |

> ⚠️ **Note:** `forgot-password` and `reset-password` call WordPress **directly** from the browser (no proxy). If CORS is restricted on the WP server, these will fail in production. A proxy route should be added for both.

---

## G. Data Flow

```
Browser
  │
  ├── Auth actions (login / register / refresh / logout / me / orders)
  │     └── POST/GET /api/auth/* or /api/account/*
  │           └── Next.js route handler (CORS proxy)
  │                 └── POST/GET {WP_URL}/wp-json/api/*
  │                       └── WordPress custom plugin (JWT auth)
  │
  ├── Forgot / Reset password
  │     └── POST {WP_URL}/wp-json/api/auth/forgot-password|reset-password
  │           └── WordPress custom plugin (directly, no proxy) ⚠️
  │
  ├── Cart operations (add / get / update / remove)
  │     └── POST/GET/PUT/DELETE {WP_URL}/wp-json/wpadhlwrapi/v1/cart/*
  │           └── WordPress custom plugin (directly, no proxy)
  │                 Uses `Authorization: Bearer <access_token>`
  │                 OR `X-Cart-Token: <guest_token>` from localStorage
  │
  └── Place order
        └── POST {WP_URL}/wp-json/api/checkout (directly, no proxy)
              └── WordPress custom plugin (requires Bearer token)

Next.js Server (RSC / build / ISR)
  │
  ├── Products (list / single / slugs)
  │     └── GET {WP_URL}/wp-json/wpadhlwrapi/v1/products[/{slug}]
  │           └── WordPress custom plugin (ISR, no auth required)
  │
  └── Orders (server-side pre-render)
        └── GET {WP_URL}/wp-json/api/orders
              └── WordPress custom plugin (Bearer token from server cookies)
```

---

## H. Token Architecture

| Token | Storage | TTL | Used for |
|---|---|---|---|
| `access_token` | httpOnly cookie + `tokenCache` (in-memory, client) | 1 hour | All authenticated API calls |
| `refresh_token` | httpOnly cookie | 14 days | Renew access_token via `/api/auth/refresh` |
| `cart_token` (guest) | `localStorage['cart_token']` | Server-defined | Guest cart operations |

`apiClient` (`src/lib/api/client.ts`) auto-retries any `401` response by calling `/api/auth/refresh`. If the refresh also fails, it calls `_onUnauthorized()` which redirects to `/login`.

---

## I. Unused but Expected APIs

| API | Status | Notes |
|---|---|---|
| `GET /wc/v3/products` | ❌ Not used | Replaced entirely by `wpadhlwrapi/v1/products` |
| `POST /wc/store/cart` | ❌ Not used | Replaced entirely by `wpadhlwrapi/v1/cart/*` |
| `POST /wc/store/checkout` | ❌ Not used | Replaced entirely by `api/checkout` |
| `GET /wp/v2/posts` | ❌ Not used | No blog feature implemented |
| `GET /wp/v2/pages` | ❌ Not used | No CMS-driven pages |
| `GET /wp/v2/users` | ❌ Not used | Replaced by `api/user` |
| `PUT /wp-json/api/user` | ❌ Not used | Profile update is stubbed in `Settings.tsx` with a TODO comment — no API call wired yet |
| `POST /wp-json/api/auth/logout` | ❌ Not used | Logout is cookie-only (client-side); no server-side token revocation call |

---

## J. Bug Found & Fixed

**Double `/wp-json` in password reset forms** — fixed during this audit.

`config.apiBase` is defined as `{WP_URL}/wp-json`, so prepending `/wp-json` again produced the broken path `{WP_URL}/wp-json/wp-json/api/...` (HTTP 404 in production).

| File | Old URL (broken) | Fixed URL |
|---|---|---|
| `src/components/auth/ForgotPasswordForm.tsx:29` | `` `${config.apiBase}/wp-json/api/auth/forgot-password` `` | `` `${config.apiBase}/api/auth/forgot-password` `` |
| `src/components/auth/ResetPasswordForm.tsx:47` | `` `${config.apiBase}/wp-json/api/auth/reset-password` `` | `` `${config.apiBase}/api/auth/reset-password` `` |

---

## K. Summary

| Metric | Value |
|---|---|
| WooCommerce REST API endpoints used | **0** |
| WooCommerce Store API endpoints used | **0** |
| WordPress Default REST API endpoints used | **0** |
| Custom `wpadhlwrapi/v1` endpoints used | **6** (2 products, 4 cart) |
| Custom `api` namespace endpoints used | **8** (5 auth, 1 user, 1 orders, 1 checkout) |
| **Total backend endpoints** | **14** |
| Direct browser → WP calls (no proxy) | 7 (cart ×4, checkout ×1, forgot-pw ×1, reset-pw ×1) |
| Browser → Next.js proxy → WP calls | 6 (login, register, refresh, me, logout, orders) |
| Server-side → WP calls | 4 (products list, product by slug, all slugs, orders) |
| Architecture | **Custom wrapper API only** — no native WC or WP REST used |

> **Key takeaway:** This project does **not** use any standard WooCommerce or WordPress REST APIs. All data flows through two custom plugin namespaces (`wpadhlwrapi/v1` and `api`). The Next.js layer acts as a CORS proxy for browser-initiated authenticated requests, while server-side rendering calls WordPress directly.
