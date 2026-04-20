# Code Documentation

**Next.js Headless eCommerce Frontend** — Complete Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Core Modules](#core-modules)
4. [Data Flow](#data-flow)
5. [API Layer](#api-layer)
6. [State Management](#state-management)
7. [Components & Pages](#components--pages)
8. [Authentication & Authorization](#authentication--authorization)
9. [Coding Conventions](#coding-conventions)
10. [Security Practices](#security-practices)
11. [How-To Guides](#how-to-guides)
12. [Deployment & Configuration](#deployment--configuration)

---

## Architecture Overview

This is a **Next.js 16 (App Router)** headless eCommerce frontend built for a WordPress/WooCommerce backend via a custom REST API (`api.themejoker.com`).

### Key Technologies

- **Frontend**: Next.js 16+ (App Router, Server/Client Components)
- **Styling**: Tailwind CSS v4, utility-first approach
- **State Management**: Zustand (lightweight client-side state)
- **UI Components**: Base UI (Radix UI primitives)
- **TypeScript**: Strict mode, full type safety
- **Backend**: WordPress REST API + WooCom merce
- **Authentication**: JWT (httpOnly cookies + access token in memory)
- **Deployment**: Vercel

### Architectural Layers

```
┌─────────────────────────────────────────────────────────┐
│  Pages (App Router) — Server/Client Components          │
├─────────────────────────────────────────────────────────┤
│  Components — Reusable UI building blocks               │
├─────────────────────────────────────────────────────────┤
│  Stores (Zustand) — Client-side state (auth, cart)      │
├─────────────────────────────────────────────────────────┤
│  API Layer — Typed fetch wrappers, error handling       │
├─────────────────────────────────────────────────────────┤
│  Next.js Route Handlers (/api/*) — Server-side proxies  │
├─────────────────────────────────────────────────────────┤
│  WordPress REST API (api.themejoker.com)                │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # Next.js Route Handlers (server-side proxies)
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   └── me/route.ts
│   │   └── account/              # User account endpoints
│   │       └── orders/route.ts
│   ├── (shop)/                   # Layout group
│   │   ├── layout.tsx            # Shop layout (not used for home)
│   │   ├── page.tsx              # Homepage
│   │   └── products/
│   │       ├── page.tsx          # Product listing page
│   │       └── [slug]/page.tsx   # Product detail page
│   ├── layout.tsx                # Root layout (header, footer, hydration)
│   ├── page.tsx                  # Homepage redirect
│   ├── login/page.tsx            # Login page (CSR)
│   ├── register/page.tsx         # Registration page (CSR)
│   ├── account/page.tsx          # User account dashboard (CSR protected)
│   ├── cart/page.tsx             # Full cart page (CSR)
│   ├── checkout/page.tsx         # Checkout page (CSR)
│   └── order-confirmation/[id]/page.tsx
│
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components (button, sheet, etc)
│   │   ├── button.tsx
│   │   ├── sheet.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # Global header/navigation
│   │   ├── Footer.tsx            # Global footer
│   │   └── AuthHydrator.tsx      # Auth restoration on page load
│   ├── home/                     # Homepage sections
│   │   ├── HeroSection.tsx
│   │   ├── CategoryShowcase.tsx
│   │   ├── FeaturedProducts.tsx
│   │   └── NewsletterSection.tsx
│   ├── product/                  # Product detail components
│   │   ├── ProductImages.tsx     # Image gallery
│   │   ├── VariationSelector.tsx # Color/size selection
│   │   ├── ProductTabs.tsx       # Description/info tabs
│   │   └── RelatedProducts.tsx
│   ├── shop/                     # Shop listing components
│   │   ├── ShopSidebar.tsx       # Filters
│   │   ├── ShopTopBar.tsx        # Sort/view options
│   │   └── ShopClient.tsx        # Client state shell
│   ├── cart/                     # Cart components
│   │   ├── CartDrawer.tsx        # Mini cart sidebar
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── FreeShippingBar.tsx
│   ├── checkout/                 # Checkout components
│   │   ├── CheckoutForm.tsx
│   │   └── OrderSummary.tsx
│   └── account/                  # Account page components
│       └── OrdersList.tsx        # Paginated orders table
│
├── lib/                          # Utility and service modules
│   ├── api/                      # API layer (typed fetch wrappers)
│   │   ├── client.ts             # Central apiClient with auth & retry logic
│   │   ├── products.ts           # Product endpoints
│   │   ├── cart.ts               # Cart endpoints
│   │   ├── checkout.ts           # User & order endpoints
│   │   └── orders.ts             # Orders pagination
│   ├── config.ts                 # App configuration & constants
│   ├── errors.ts                 # Custom error class
│   └── utils.ts                  # Utility functions (cn, etc)
│
├── stores/                       # Zustand state stores
│   ├── authStore.ts              # Authentication state & actions
│   └── cartStore.ts              # Shopping cart state & actions
│
└── (assets in public/)           # Images, fonts, etc (via /public)
```

---

## Core Modules

### 1. **API Layer** (`src/lib/api/`)

The API layer provides **typed, composable fetch wrappers** with built-in error handling, auth, and retry logic.

#### `client.ts` — Central API Client

**Responsibilities:**
- Central `apiClient()` function with automatic Authorization header injection
- `tokenCache` — in-memory JWT access token (expires on page load)
- Auto-retry on 401 Unauthorized (calls `/api/auth/refresh`)
- Error parsing & throwing typed `ApiError`
- Metadata preservation (pagination fields not lost on response)

**Key exports:**

```ts
export const apiClient: <T>(endpoint: string, opts?: FetchInit) => Promise<T>
export const tokenCache: { get(), set(token?: string) }
export function setOnUnauthorized(fn: () => void)
```

**Flow:**
1. Caller invokes `apiClient('products', { method: 'GET' })`
2. Function reads `tokenCache.get()` → injects `Authorization: Bearer {token}` header
3. Calls WordPress REST API via `config.apiBase`
4. Parses JSON response
5. If 401 → auto-calls `/api/auth/refresh` → retries once
6. Throws `ApiError` on failure; returns `data` on success

#### `products.ts` — Product Endpoints

**Functions:**
- `getAllProducts(page, perPage)` — List products with pagination
- `getAllProductSlugs()` — Static generation helper
- `getProductBySlug(slug)` — Single product detail
- `getCategoryProducts(categoryId, page, perPage)` — Filter by category

**Endpoint:** `POST /wpadhlwrapi/v1/products`

**Authentication:** None (public products)

#### `cart.ts` — Cart Operations

**Functions:**
- `apiGetCart()` — Get current cart (guest or user)
- `apiAddToCart(productId, variationId, quantity)` — Add to cart
- `apiUpdateCartItem(itemId, quantity)` — Update quantity
- `apiRemoveCartItem(itemId)` — Remove item

**Auth:** Guest JWT (localStorage) or user token

**Note:** Cart API does **NOT** return item prices; prices calculated at checkout only.

#### `checkout.ts` — User & Orders

**Functions:**
- `getUser()` — Fetch current user profile (browser proxies through `/api/auth/me`)
- `placeOrder(payload)` — Create order (POST)

**Note:** Proxies through `/api/auth/me` to avoid CORS directly with WordPress API.

#### `orders.ts` — Order History

**Function:**
- `getOrders(page, perPage)` — Paginated order list

**Special:**
- Raw `fetch()` (not `apiClient`) to preserve `meta` pagination field
- Browser calls `/api/account/orders` proxy (server-to-server CORS bypass)

---

### 2. **Route Handlers** (`src/app/api/`)

Next.js route handlers act as **server-side proxies** to the WordPress API. This solves CORS issues (browser→WordPress blocked, but server→server is allowed).

#### `/api/auth/login` — POST

**Request:**
```json
{ "username": "user@email.com", "password": "pass", "guest_cart_token?: string" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt...",
    "user": { "id", "email", "display_name" }
  }
}
```

**Flow:**
1. Extracts `username/password` from request body
2. Calls WordPress `/wp-json/api/login` server-side
3. Sets `httpOnly` cookie `refresh_token` (auto-managed by browser)
4. Returns `access_token` + user data in response body

#### `/api/auth/refresh` — POST

**Response:**
```json
{ "success": true, "data": { "token": "new_jwt" } }
```

**Flow:**
1. Reads `refresh_token` from httpOnly cookie (auto-attached by browser)
2. Calls WordPress `/wp-json/api/refresh` server-side
3. Returns new `access_token`

#### `/api/auth/me` — GET

**Purpose:** Fetch current user profile (used by `getUser()`)

**Auth:** Requires `Authorization: Bearer {token}` header (injected by browser)

**Response:**
```json
{ "success": true, "data": { "user": {...} OR {...} directly } }
```

#### `/api/account/orders` — GET

**Purpose:** Fetch paginated orders (used by `getOrders()`)

**Query params:** `?page=1&per_page=10`

**Flow:**
1. Reads `Authorization` header
2. Queries WordPress `/wp-json/api/orders?page=...&per_page=...`
3. Returns full response (including `meta` pagination field)

---

### 3. **State Management** (`src/stores/`)

#### `authStore.ts` — Zustand Authentication Store

**State:**
```ts
interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  hydrated: boolean  // hydration complete flag
}
```

**Actions:**
- `login(username, password, guestToken?)` — POST to `/api/auth/login`
- `register(email, password, first_name, last_name)` — POST to `/api/auth/register`
- `logout()` — Clear token, call `/api/auth/logout`
- `refreshToken()` — Call `/api/auth/refresh`
- `hydrate()` — Restore auth on page load (async, sets `hydrated: true` when done)

**Key Logic:**
- `tokenCache.set()` called on login/register → stores JWT in memory
- On page reload, `hydrate()` calls `/api/auth/refresh` to get new token from cookie
- `setOnUnauthorized()` callback redirects to `/login` on persistent 401

#### `cartStore.ts` — Zustand Cart Store

**State:**
```ts
interface CartState {
  items: CartItem[]
  cartToken: string | null
  guestToken: string | null
  loading: boolean
  error: string | null
  cartDrawerOpen: boolean
}
```

**Actions:**
- `fetchCart()` — GET current cart
- `addItem(productId, variationId, quantity)` — POST add
- `updateItem(itemId, quantity)` — PUT update
- `removeItem(itemId)` — DELETE remove
- `clearGuestToken()` — Wipe localStorage `cart_token` on login
- `clearCart()` — Reset items (post-order)
- `setCartDrawerOpen(open)` — Toggle mini cart sidebar

**Key Logic:**
- First `addItem()` returns `guest_token` → stored in `localStorage['cart_token']`
- Guest token passed to all cart endpoints via `getGuestToken()`
- Logged-in users pass user token instead
- Cart endpoints return full `CartData` (items + token) — state updated atomically

---

### 4. **Configuration** (`src/lib/config.ts`)

**Purpose:** Centralized environment & constant config

**Key exports:**

```ts
export const config = {
  apiBase: `${NEXT_PUBLIC_WP_URL}/wp-json`,  // e.g., https://api.themejoker.com/wp-json
  productsNs: 'wpadhlwrapi/v1',             // Products namespace
  apiNs: 'api',                             // Auth/orders namespace
  siteName: 'HeadlessECF',                  // Site name (env var)
  hero: { ... },                            // Homepage hero config
  features: { registration: true, ... }
}
```

**Note:** `NEXT_PUBLIC_WP_URL` trailing slash is stripped to prevent double-slashes in URLs.

---

### 5. **Error Handling** (`src/lib/errors.ts`)

**Custom error class:**

```ts
export class ApiError extends Error {
  code: string      // 'session_expired', 'invalid_token', 'user_not_found', etc
  statusCode: number

  constructor(code: string, message: string, statusCode = 400) { ... }
}
```

**Usage:**
```ts
try {
  await getUser()
} catch (e) {
  if (e instanceof ApiError && e.code === 'invalid_token') {
    router.replace('/login')
  }
}
```

---

## Data Flow

### Example: User Login Flow

```
1. User submits login form in LoginPage (CSR)
   ↓
2. useAuthStore().login(email, password)
   ↓
3. POST /api/auth/login (Next.js handler)
   ↓
4. Handler calls POST https://api.themejoker.com/wp-json/api/login (server-to-server)
   ↓
5. WordPress returns { access_token, refresh_token, user }
   ↓
6. Next.js sets httpOnly cookie `refresh_token`, returns access_token in body
   ↓
7. Store sets tokenCache.set(access_token), updates auth state
   ↓
8. Browser redirects to /account or /products
```

### Example: Fetch Protected User Data (Account Page)

```
1. AccountPage (CSR) mounts
   ↓
2. useAuthStore() → hydrated? → wait for auth hydration
   ↓
3. hydrate() called by AuthHydrator (root layout)
   → POST /api/auth/refresh (cookie auto-attached)
   → receives new access_token → tokenCache.set()
   → set hydrated: true
   ↓
4. Account page's useEffect fires (depends on [hydrated])
   ↓
5. Calls getUser() and getOrders()
   ↓
6. Both make request with tokenCache JWT
   ↓
7. Browser auto-routes through `/api/auth/me` and `/api/account/orders` proxies
   ↓
8. Proxies add Authorization header, call WordPress server-side (no CORS)
   ↓
9. Responses returned to browser, page renders
```

### Example: Add Product to Cart (Guest)

```
1. ProductDetail page → click "Add to Cart"
   ↓
2. useCartStore().addItem(productId, variationId, qty)
   ↓
3. POST /wpadhlwrapi/v1/cart/add (via apiClient)
   ↓
4. WordPress returns { items, cart_token, guest_token }
   ↓
5. First time? localStorage.setItem('cart_token', guest_token)
   ↓
6. cartStore updates items, shows mini cart drawer
   ↓
7. Next add? Passes stored guest_token in Authorization header
```

---

## API Layer

### How to Call an API Endpoint

#### Option 1: Using `apiClient` (most common)

```ts
import { apiClient } from '@/lib/api/client'
import { config } from '@/lib/config'

// GET
const products = await apiClient<Product[]>(`${config.productsNs}/products`)

// POST with body
const result = await apiClient<OrderResult>(`${config.apiNs}/checkout`, {
  method: 'POST',
  body: JSON.stringify({ gateway: 'stripe', ... })
})
```

**Automatically includes:**
- `Authorization: Bearer {token}` header (if logged in)
- `Content-Type: application/json`
- Error handling + 401 auto-refresh
- JSON parsing

#### Option 2: Raw `fetch()` + `tokenCache` (for special cases)

```ts
import { tokenCache } from '@/lib/api/client'

const token = tokenCache.get()
const res = await fetch(`${apiBase}/custom/endpoint`, {
  headers: {
    Authorization: token ? `Bearer ${token}` : ''
  }
})
```

**Use when:**
- You need to preserve response `meta` fields
- Standard `apiClient` loses metadata via `parseBody`

---

## State Management

### Using Auth Store

```ts
import { useAuthStore } from '@/stores/authStore'

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  return (
    <>
      {isAuthenticated ? (
        <>Hello, {user?.display_name}</>
      ) : (
        <button onClick={() => login('user@email.com', 'pass')}>Login</button>
      )}
    </>
  )
}
```

### Using Cart Store

```ts
import { useCartStore } from '@/stores/cartStore'

export function ProductCard({ product }) {
  const { addItem, loading } = useCartStore()

  return (
    <button
      onClick={() => addItem(product.id, 0, 1)}
      disabled={loading}
    >
      Add to Cart
    </button>
  )
}
```

---

## Components & Pages

### Page Types

#### 1. **Server Components** (default, App Router)

```ts
// src/app/(shop)/products/page.tsx
export default async function ProductsPage() {
  const products = await getAllProducts(1, 20)  // Cached, revalidates every 60s
  return <ShopClient initialProducts={products} />
}
```

**Benefits:** SEO, faster initial load, no JS hydration

#### 2. **Client Components** (interactive, state)

```ts
// src/app/login/page.tsx
'use client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const { login } = useAuthStore()
  // ...
}
```

**Use when:** Form state, real-time updates, browser APIs

#### 3. **Hybrid** (Server layout + Client content)

```ts
// src/app/layout.tsx (Server)
export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthHydrator />  {/* Client component to restore auth */}
        <Header />        {/* Server component */}
        {children}        {/* Dynamic page */}
      </body>
    </html>
  )
}
```

### UI Component Library

Base UI components exported from `src/components/ui/`:

- `button.tsx` — Primary button component (do NOT use `asChild`)
- `sheet.tsx` — Slide-in drawer (used for mini cart)
- Others as needed

**Tailwind-only styling** — no CSS files

---

## Authentication & Authorization

### Token Flow

```
                    ┌─ BROWSER ─────────────────────────────────────────────────┐
                    │                                                              │
                    │  tokenCache (in-memory)                                    │
                    │  ├─ access_token: "jwt..."                               │
                    │  └─ (expires on page reload)                             │
                    │                                                              │
                    │  localStorage:                                             │
                    │  └─ cart_token: "guest_jwt..." (guest only)               │
                    │                                                              │
                    │  Cookies (httpOnly):                                       │
                    │  └─ refresh_token: "jwt..." (auto-managed)                │
                    │                                                              │
                    └──────────────────────────────────────────────────────────────┘
                                              ↓
                        ┌─ NEXT.JS API ROUTES ────────────────────┐
                        │ POST /api/auth/login                    │
                        │ POST /api/auth/refresh                  │
                        │ POST /api/auth/logout                   │
                        │ GET  /api/auth/me                       │
                        └─────────────────────────────────────────┘
                                              ↓
                        ┌─ WORDPRESS REST API ──────────────────┐
                        │ POST /wp-json/api/login                │
                        │ POST /wp-json/api/refresh              │
                        │ POST /wp-json/api/logout               │
                        │ GET  /wp-json/api/user                 │
                        └────────────────────────────────────────┘
```

### Protected Pages

**Pattern 1: Redirect to login if not authenticated**

```ts
'use client'

export default function AccountPage() {
  const { hydrated, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated])

  if (!hydrated) return <Spinner />  // Wait for auth restoration
  // ... render account content
}
```

**Pattern 2: Catch auth errors + redirect**

```ts
try {
  const user = await getUser()
} catch (e) {
  if (e instanceof ApiError && e.code === 'invalid_token') {
    await logout()
    router.replace('/login')
  }
}
```

---

## Coding Conventions

### Naming

- **Components:** PascalCase (e.g., `ProductCard.tsx`)
- **Functions:** camelCase (e.g., `getProductBySlug()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `FREE_SHIPPING_THRESHOLD = 100`)
- **API functions:** Prefix with `api` or `get` (e.g., `apiGetCart()`, `getUser()`)
- **Store names:** `*Store` suffix (e.g., `authStore`, `cartStore`)

### File Structure

```
ComponentName/
├── ComponentName.tsx      # Main component export
├── ComponentName.test.ts  # Tests (if applicable)
└── index.ts              # Re-export (optional)
```

Or flat structure for small components:
```
ComponentName.tsx
```

### TypeScript

**Always use strict types:**

```ts
// ✓ Good
interface Product {
  id: number
  name: string
  price: string
}

function getProduct(id: number): Promise<Product> { ... }

// ✗ Bad
function getProduct(id) { ... }  // Missing types
const data: any = await fetch(...)  // Never use `any`
```

### React Best Practices

**Use `'use client'` sparingly:**

```ts
// ✓ Keep as server component
export async function ProductList() {
  const products = await getAllProducts()
  return <div>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
}

// ✓ Client component for interactivity only
'use client'
export function ProductCard({ product }) {
  const [favorited, setFavorited] = useState(false)
  return ...
}
```

**Dependency arrays in useEffect:**

```ts
// Always include dependencies
useEffect(() => {
  loadData()
}, [isAuthenticated, hydrated])  // Don't omit!
```

### Tailwind CSS

- Use utility classes only (no CSS files for components)
- Mobile-first responsive: `sm:`, `md:`, `lg:`, `xl:` prefixes
- Consistent spacing: `p-4`, `gap-3`, `mb-6`
- Semantic colors: `bg-zinc-900`, `text-destructive`, `border-zinc-200`
- No magic numbers: use Tailwind's scale (4px base unit)

```ts
// ✓ Good
<div className="px-4 py-3 rounded-lg border border-zinc-200 bg-white">

// ✗ Bad
<div style={{ padding: '15px', border: '1px solid #ddd' }}>
```

---

## Security Practices

### 1. **Authentication & Tokens**

- Access tokens stored in **memory only** (`tokenCache`) — expires on page reload
- Refresh tokens in **httpOnly cookies** — cannot be accessed by JavaScript
- Logout clears both token and cookies
- 401 auto-refresh prevents premature logouts

### 2. **Authorization Header**

Never send sensitive data in URLs:

```ts
// ✓ Good — header
fetch(url, { headers: { Authorization: `Bearer ${token}` } })

// ✗ Bad — query string
fetch(`${url}?token=${token}`)
```

### 3. **Sanitization**

Always escape user input in JSX:

```ts
// ✓ React auto-escapes JSX
<p>{user.email}</p>

// ✗ dangerouslySetInnerHTML only for trusted HTML
<div dangerouslySetInnerHTML={{ __html: unsafeHtml }} />
```

### 4. **CORS & Server-Side Proxies**

Never call third-party APIs directly from browser (CORS issues):

```ts
// ✗ Bad — direct call from browser
const res = await fetch('https://api.themejoker.com/wp-json/api/user', {
  headers: { Authorization: `Bearer ${token}` }
})

// ✓ Good — proxy through Next.js
const res = await fetch('/api/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### 5. **Environment Variables**

```ts
// .env.local (gitignored)
NEXT_PUBLIC_WP_URL=https://api.themejoker.com
NEXT_PUBLIC_SITE_NAME=MyStore

// Only NEXT_PUBLIC_* are exposed to browser
// Others available in server components & API routes only
```

### 6. **Input Validation**

Validate all user input (forms, API responses):

```ts
// ✓ TypeScript type checking
const email = parseEmail(userInput)  // throws if invalid

const user: UserProfile = response.data  // Type-checked at compile-time
```

### 7. **Error Messages**

Never leak sensitive info in error messages:

```ts
// ✓ Good
throw new ApiError('auth_error', 'Invalid credentials')

// ✗ Bad
throw new Error(`User ${email} not found in database`)  // Leaks user existence
```

---

## How-To Guides

### Add a New API Endpoint

**Step 1:** Create the wrapper in `src/lib/api/products.ts` (or appropriate module)

```ts
export async function getProductReviews(productId: number): Promise<Review[]> {
  return apiClient<Review[]>(`${config.productsNs}/products/${productId}/reviews`)
}
```

**Step 2:** Use in a component

```ts
const reviews = await getProductReviews(product.id)
```

**Step 3:** (If protected) Create a Next.js route handler proxy

```ts
// src/app/api/account/reviews/route.ts
export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')
  const productId = req.nextUrl.searchParams.get('product_id')

  const wpRes = await fetch(
    `${config.apiBase}/${config.apiNs}/reviews?product_id=${productId}`,
    { headers: { Authorization: token ?? '' } }
  )
  return NextResponse.json(await wpRes.json())
}
```

### Add a New Page

**Step 1:** Create the page file

```ts
// src/app/my-page/page.tsx
import { MyComponent } from '@/components/MyComponent'

export default function MyPage() {
  return <MyComponent />
}
```

**Step 2:** (If it needs layout) Create a layout file in the same folder

```ts
// src/app/my-page/layout.tsx
export default function MyPageLayout({ children }) {
  return <div className="container">{children}</div>
}
```

**Step 3:** (If interactive) Use `'use client'` and Zustand stores

```ts
'use client'
import { useCartStore } from '@/stores/cartStore'

export default function MyPage() {
  const { items } = useCartStore()
  return ...
}
```

### Add a New Component

**Step 1:** Create the file

```ts
// src/components/MyComponent.tsx
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  onClick?: () => void
}

export function MyComponent({ title, onClick }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={onClick}>Click me</Button>
    </div>
  )
}
```

**Step 2:** Import and use it

```ts
import { MyComponent } from '@/components/MyComponent'

export default function Page() {
  return <MyComponent title="Hello" />
}
```

### Add a New Zustand Store

**Step 1:** Create the store

```ts
// src/stores/featureStore.ts
import { create } from 'zustand'

interface FeatureState {
  enabled: boolean
  toggle: () => void
}

export const useFeatureStore = create<FeatureState>((set) => ({
  enabled: false,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
}))
```

**Step 2:** Use in a client component

```ts
'use client'
import { useFeatureStore } from '@/stores/featureStore'

export function FeatureToggle() {
  const { enabled, toggle } = useFeatureStore()
  return <button onClick={toggle}>{enabled ? 'On' : 'Off'}</button>
}
```

### Handle API Errors Gracefully

**Pattern: Try-catch + custom error handling**

```ts
'use client'

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const user = await getUser()
        setProfile(user)
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.code === 'invalid_token') {
            await logout()
            router.replace('/login')
          } else {
            setError(e.message)
          }
        } else {
          setError('Something went wrong')
        }
      }
    }
    load()
  }, [])

  if (error) return <div className="text-red-600">{error}</div>
  if (!profile) return <Spinner />
  return <div>{profile.display_name}</div>
}
```

---

## Deployment & Configuration

### Environment Variables

Set these in `.env.local` (local dev) or Vercel Settings → Environment Variables (production):

```
NEXT_PUBLIC_WP_URL=https://api.themejoker.com
NEXT_PUBLIC_SITE_NAME=MyStore
NEXT_PUBLIC_HERO_TITLE=Welcome to My Store
NEXT_PUBLIC_HERO_CTA_TEXT=Shop Now
```

### Build & Deployment

**Local dev:**
```bash
npm install
npm run dev
# Opens http://localhost:3000
```

**Build:**
```bash
npm run build
```

**Deploy to Vercel:**
```bash
vercel --prod
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "CORS error on /account" | Browser calling API directly | Verify all auth calls proxy through `/api/*` routes |
| "Failed to load account" | Auth race condition | Ensure page waits for `hydrated === true` before calling APIs |
| "Double-slash in URL" | `NEXT_PUBLIC_WP_URL` has trailing slash | Config strips trailing slash: `.replace(/\/$/, '')` |
| "404 on product page" | ISR revalidation stale | Rebuild or trigger manual revalidation |
| Build fails on Vercel | `NEXT_PUBLIC_WP_URL` not set | Add to Vercel env vars |

---

## File Reference

### Key Files to Know

- **`src/app/layout.tsx`** — Root layout, global header/footer, auth hydration
- **`src/stores/authStore.ts`** — Auth state, login/logout logic
- **`src/stores/cartStore.ts`** — Cart state, add/remove/update items
- **`src/lib/api/client.ts`** — Central API client with error handling & auto-refresh
- **`src/lib/config.ts`** — Configuration & environment variables
- **`src/components/layout/Header.tsx`** — Global navigation
- **`src/app/api/auth/login/route.ts`** — Login endpoint proxy

---

## Contributing

When adding features:

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make changes following conventions above
3. Test locally: `npm run build` (ensures no errors)
4. Commit with clear message: `git commit -m "Add X feature"`
5. Push and open a PR

---

**Last Updated:** April 21, 2026  
**Maintained By:** Development Team  
**For Questions:** See README.md or contact the team
