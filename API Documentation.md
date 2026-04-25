# API Documentation — WPAppsDev Headless Wrapper API

> **Version:** 1.0.0
> **Base URL:** `https://your-wp-site.com/wp-json`
> **Format:** JSON
> **Auth:** Bearer JWT (HS256)

This document is structured for both human developers and AI code-generation systems. Each section includes endpoint specs, example requests/responses, error cases, and ready-to-use Next.js usage examples.

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Base URL & Namespaces](#2-base-url--namespaces)
3. [Authentication](#3-authentication)
4. [Standard Request/Response Format](#4-standard-requestresponse-format)
5. [Auth Endpoints](#5-auth-endpoints)
6. [Products](#6-products)
7. [Cart](#7-cart)
8. [Checkout](#8-checkout)
9. [Orders](#9-orders)
10. [Customer (User Profile)](#10-customer-user-profile)
11. [Error Reference](#11-error-reference)
12. [Complete Typical Flows](#12-complete-typical-flows)
13. [Environment Configuration](#13-environment-configuration)

---

## 1. API Overview

This plugin exposes WooCommerce data through a stateless REST API designed for headless frontends. Key characteristics:

- **Stateless:** No cookies, no PHP sessions, no WooCommerce cart sessions.
- **JWT authentication:** Access tokens (1 hour) + refresh tokens (14 days). Guest shoppers receive a separate guest JWT for cart persistence.
- **Custom cart table:** All cart state is stored in `wp_hl_cart` — independent of WooCommerce's session-based cart.
- **Normalizer pattern:** All responses are explicitly whitelisted — no raw WordPress/WooCommerce internal fields are ever exposed.
- **Extensible payment layer:** New payment gateways can be added via a WordPress filter without modifying plugin code.

---

## 2. Base URL & Namespaces

```
Base: https://your-wp-site.com/wp-json
```

| Namespace | Full Base URL | Used For |
|---|---|---|
| `wpadhlwrapi/v1` | `/wp-json/wpadhlwrapi/v1/` | Products, Cart |
| `api` | `/wp-json/api/` | Auth, Checkout, Orders, User |

---

## 3. Authentication

### Token Types

| Token | TTL | Used For |
|---|---|---|
| `access_token` (User JWT) | 1 hour | All protected endpoints |
| `refresh_token` (User JWT) | 14 days | Obtaining a new access token |
| `guest_token` (Guest JWT) | 30 days | Cart persistence for unauthenticated users |

### Using a Token

Include the token in the `Authorization` header of every authenticated request:

```
Authorization: Bearer <access_token>
```

### Protected Routes

The following route prefixes require a valid `Authorization: Bearer` header. Requests without a token (or with an expired/invalid token) receive **HTTP 401**.

| Prefix | Endpoints |
|---|---|
| `/api/user` | `GET /api/user` |
| `/api/orders` | `GET /api/orders` |
| `/api/checkout` | `POST /api/checkout` |

All other routes (`/api/auth/*`, `/wpadhlwrapi/v1/*`) are publicly accessible.

### Token Acquisition Flow

```
POST /api/auth/login  →  { access_token, refresh_token, expires_in: 3600 }
  ↓ (when access token expires)
POST /api/auth/refresh  →  { token, expires_in: 3600 }
```

---

## 4. Standard Request/Response Format

### Request

- `Content-Type: application/json` for POST/PUT requests with a body.
- Query parameters for GET requests.

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Success Response

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 45,
    "total_pages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "code": "error_code",
  "message": "Human-readable description."
}
```

Some errors use WP REST API's native format:
```json
{
  "code": "error_code",
  "message": "Human-readable description.",
  "data": { "status": 401 }
}
```

---

## 5. Auth Endpoints

All auth endpoints live under `/wp-json/api/auth/`. None require a Bearer token.

### 5.1 Login

**`POST /wp-json/api/auth/login`**

Exchange credentials for a JWT pair. Optionally merges a guest cart.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | string | ✅ | WordPress username or email |
| `password` | string | ✅ | Account password |
| `guest_cart_token` | string | — | Guest JWT — triggers guest-to-user cart merge on login |

#### Example Request

```
POST /wp-json/api/auth/login
Content-Type: application/json

{ "username": "jane.doe", "password": "my-secure-password", "guest_cart_token": "eyJhbGci..." }
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_in": 3600,
    "user": { "id": 5, "email": "jane@example.com", "display_name": "Jane Doe" }
  }
}
```

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `invalid_credentials` | 401 | Wrong username or password |

---

### 5.2 Refresh Token

**`POST /wp-json/api/auth/refresh`**

Exchange a refresh token for a new access token.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh_token` | string | ✅ | Refresh token from login response |

#### Example Response

```json
{ "success": true, "data": { "token": "eyJhbGci...", "expires_in": 3600 } }
```

---

### 5.3 Register

**`POST /wp-json/api/auth/register`**

Creates a new customer account and immediately returns a JWT pair — the user is authenticated without a second login step.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string (email) | ✅ | Email address for the new account |
| `password` | string | ✅ | Password — minimum 8 characters |
| `first_name` | string | — | Customer first name |
| `last_name` | string | — | Customer last name |

#### Example Request

```
POST /wp-json/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepass123",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_in": 3600,
    "user": {
      "id": 12,
      "email": "newuser@example.com",
      "display_name": "Jane Doe"
    }
  }
}
```

#### Notes

- HTTP status is **201 Created** (not 200).
- A username is derived automatically from the email's local part and made unique — the user never needs to know it; they log in with email.
- The `register_new_user` WordPress action fires after account creation, triggering standard admin notification emails.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `email_exists` | 400 | An account with that email already exists |
| `registration_failed` | 400 | WordPress `wp_insert_user()` returned an error |
| `rest_invalid_param` | 400 | Email format invalid or password shorter than 8 characters |

---

### 5.4 Forgot Password

**`POST /wp-json/api/auth/forgot-password`**

Triggers a native WordPress password-reset email. The reset link in the email points to the headless frontend URL (configurable via a WordPress filter — see below).

A **generic success message is always returned** regardless of whether an account exists for the email address — this prevents account enumeration attacks.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string (email) | ✅ | Email address of the account to recover |

#### Example Request

```
POST /wp-json/api/auth/forgot-password
Content-Type: application/json

{ "email": "jane@example.com" }
```

#### Example Response (always 200)

```json
{
  "success": true,
  "data": {
    "message": "If an account exists with that email address, a password reset link has been sent."
  }
}
```

#### Configuring the Reset URL (Required for Headless)

By default the reset link points to `{site_home_url}/reset-password?key=...&login=...`. Override this for your headless frontend by adding to your theme's `functions.php` or a site-specific plugin:

```php
add_filter(
    'wpadhlwrapi_reset_password_base_url',
    fn() => 'https://my-nextjs-app.com/reset-password'
);
```

The frontend receives the reset link as:
```
https://my-nextjs-app.com/reset-password?key=abc123xyz&login=janedoe
```

Extract `key` and `login` from the URL query params and pass them to `POST /api/auth/reset-password`.

---

### 5.5 Reset Password

**`POST /wp-json/api/auth/reset-password`**

Validates the reset key and login from the email link, then updates the user's password.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | ✅ | Reset key from the email link (`?key=...`) |
| `login` | string | ✅ | WordPress username from the email link (`?login=...`) |
| `new_password` | string | ✅ | New password — minimum 8 characters |

#### Example Request

```
POST /wp-json/api/auth/reset-password
Content-Type: application/json

{
  "key": "abc123xyz",
  "login": "janedoe",
  "new_password": "my-new-secure-password"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "message": "Your password has been updated. You can now log in with your new password."
  }
}
```

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `invalid_reset_key` | 400 | Key is invalid, has expired, or the login does not match |
| `rest_invalid_param` | 400 | `new_password` shorter than 8 characters |

---

### 5.6 AI-Friendly: Auth Endpoints

**When to use each endpoint:**
- `POST /auth/login` — login form submission
- `POST /auth/refresh` — silently renew expired access token (background)
- `POST /auth/register` — registration form submission
- `POST /auth/forgot-password` — "Forgot password?" form
- `POST /auth/reset-password` — password reset form (reached via email link)

**Registration Flow:**
1. Collect `email`, `password`, `first_name`, `last_name` from form
2. `POST /auth/register` → save `access_token` + `refresh_token`
3. Redirect to account/home page — user is immediately logged in

**Forgot/Reset Password Flow:**
1. User enters email → `POST /auth/forgot-password` → show "check your email" message
2. User clicks link in email → frontend page at `/reset-password?key=...&login=...`
3. Collect `new_password` → `POST /auth/reset-password` with `key`, `login`, `new_password`
4. On success → redirect to login page

**Next.js Example:**

```typescript
// lib/api/auth.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json/api';

export async function register(data: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.success) {
    localStorage.setItem('access_token', json.data.access_token);
    localStorage.setItem('refresh_token', json.data.refresh_token);
  }
  return json; // { success, data: { access_token, refresh_token, expires_in, user } }
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json(); // always { success: true, data: { message } }
}

export async function resetPassword(key: string, login: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, login, new_password: newPassword }),
  });
  return res.json(); // { success, data: { message } } or WP_Error
}

// Reset-password page component (Next.js App Router)
// app/reset-password/page.tsx
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { key: string; login: string };
}) {
  async function handleSubmit(formData: FormData) {
    'use server';
    const result = await resetPassword(
      searchParams.key,
      searchParams.login,
      formData.get('password') as string
    );
    if (result.success) redirect('/login?reset=1');
  }

  return (
    <form action={handleSubmit}>
      <input type="password" name="password" minLength={8} required />
      <button type="submit">Reset Password</button>
    </form>
  );
}
```

---

## 6. Products

### 6.1 List Products

Returns a paginated list of published WooCommerce products.

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `per_page` | integer | `10` | Items per page (max 100) |
| `category` | string | — | Filter by category slug |
| `search` | string | — | Keyword search |

#### Example Request

```
GET /wp-json/wpadhlwrapi/v1/products?page=1&per_page=12&category=t-shirts
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "Classic Crew Neck Tee",
      "slug": "classic-crew-neck-tee",
      "permalink": "https://example.com/product/classic-crew-neck-tee/",
      "type": "variable",
      "status": "publish",
      "description": "<p>Premium cotton t-shirt...</p>",
      "short_description": "Everyday essential.",
      "sku": "TEE-001",
      "price": "29.99",
      "regular_price": "34.99",
      "sale_price": "29.99",
      "on_sale": true,
      "stock_status": "instock",
      "stock_quantity": null,
      "manage_stock": false,
      "categories": [
        { "id": 9, "name": "T-Shirts", "slug": "t-shirts" }
      ],
      "images": [
        { "id": 101, "url": "https://example.com/wp-content/uploads/tee-front.jpg", "alt": "Tee front view" }
      ],
      "variations": [201, 202, 203]
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 12,
    "total": 3,
    "total_pages": 1
  }
}
```

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `rest_invalid_param` | 400 | `per_page` exceeds 100 |

---

### 6.2 Get Single Product

**`GET /wp-json/wpadhlwrapi/v1/products/{slug}`**

Returns a "fat payload" for a single product — base fields plus all variation details in one request. Eliminates the need for multiple round-trips on product detail pages.

#### URL Parameter

| Parameter | Type | Description |
|---|---|---|
| `slug` | string | URL slug of the product (e.g. `classic-crew-neck-tee`) |

#### Example Request

```
GET /wp-json/wpadhlwrapi/v1/products/classic-crew-neck-tee
```

#### Example Response — Variable Product

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Classic Crew Neck Tee",
    "slug": "classic-crew-neck-tee",
    "type": "variable",
    "price": "29.99",
    "regular_price": "34.99",
    "sale_price": "29.99",
    "on_sale": true,
    "stock_status": "instock",
    "stock_quantity": null,
    "categories": [{ "id": 9, "name": "T-Shirts", "slug": "t-shirts" }],
    "images": [
      { "id": 101, "url": "https://example.com/.../tee-front.jpg", "alt": "Tee front" }
    ],
    "variations": [
      {
        "id": 201,
        "sku": "TEE-001-S-RED",
        "price": "29.99",
        "regular_price": "34.99",
        "sale_price": "29.99",
        "on_sale": true,
        "stock_status": "instock",
        "stock_quantity": 15,
        "manage_stock": true,
        "attributes": { "pa_size": "S", "pa_color": "Red" },
        "image": "https://example.com/.../tee-red.jpg"
      }
    ]
  }
}
```

#### Example Response — Simple Product

Same shape, with `"variations": []`.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `product_not_found` | 404 | Slug does not exist, is draft, or is private |

---

### 6.3 AI-Friendly: Products

**When to use:**
- `GET /products` — product listing pages, category pages, search results
- `GET /products/{slug}` — product detail page (PDP); use this instead of making separate variation requests

**Typical Flow:**
1. `GET /products?category=shoes&page=1&per_page=12` → render product grid
2. User clicks product → `GET /products/nike-air-max` → render PDP with all variation options pre-loaded
3. User selects a variation → read from `data.variations` array (no extra API call needed)
4. User adds to cart → `POST /wpadhlwrapi/v1/cart/add` with the selected `variation_id`

**Next.js Example:**

```typescript
// lib/api/products.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json/wpadhlwrapi/v1';

export async function getProducts(params: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 12),
    ...(params.category && { category: params.category }),
    ...(params.search && { search: params.search }),
  });
  const res = await fetch(`${API_BASE}/products?${query}`);
  return res.json(); // { success, data, meta }
}

export async function getProduct(slug: string) {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  if (res.status === 404) return null;
  return res.json(); // { success, data: { ...product, variations: [...] } }
}
```

---

## 7. Cart

The cart works without authentication. On the first `POST /cart/add`, the API creates a guest session and returns a `guest_token`. Store this token client-side and send it as a Bearer token on all subsequent cart requests.

When the user logs in, pass `guest_cart_token` in the login body — the guest cart is automatically merged into the user's cart.

### 7.1 Add Item to Cart

**`POST /wp-json/wpadhlwrapi/v1/cart/add`**

Adds a product (or increments quantity if already in cart). On first call with no token, creates a new guest session.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `product_id` | integer | ✅ | WooCommerce product ID |
| `variation_id` | integer | — | Variation ID; omit or `0` for simple products |
| `quantity` | integer | — | Units to add (default: `1`) |
| `meta` | string | — | JSON-encoded custom metadata |

#### Authorization Header

| Scenario | Header |
|---|---|
| First add (no cart yet) | *(omit)* |
| Returning guest | `Authorization: Bearer <guest_token>` |
| Logged-in user | `Authorization: Bearer <access_token>` |

#### Example Request — Guest (No Token)

```
POST /wp-json/wpadhlwrapi/v1/cart/add
Content-Type: application/json

{ "product_id": 42, "variation_id": 201, "quantity": 1 }
```

#### Example Response — New Guest Session

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "cart_token": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": null,
        "product_id": "42",
        "variation_id": "201",
        "quantity": "1",
        "meta": null,
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-01-15 10:30:00",
        "product_name": "Nike Air Max 90",
        "product_image": "https://example.com/wp-content/uploads/2024/01/nike-air-max.jpg",
        "price": "99.99"
      }
    ],
    "cart_token": "550e8400-e29b-41d4-a716-446655440000",
    "guest_token": "eyJhbGci..."
  }
}
```

> ⚠️ **Important:** Save `guest_token` — this is your cart credential. Use it as `Authorization: Bearer <guest_token>` on all subsequent requests. `guest_token` only appears in the **first response** of a new session.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `out_of_stock` | 400 | Product is out of stock or has insufficient quantity |
| `malformed_authorization` | 401 | Malformed (non-Bearer) Authorization header |
| `cart_add_failed` | 500 | Database error |

---

### 7.2 Get Cart

**`GET /wp-json/wpadhlwrapi/v1/cart`**

Returns all current line items for the cart.

#### Authorization

- Guest: `Authorization: Bearer <guest_token>`
- Logged-in: `Authorization: Bearer <access_token>`
- No header: returns `{ items: [], cart_token: null }` (empty state)

#### Example Request

```
GET /wp-json/wpadhlwrapi/v1/cart
Authorization: Bearer eyJhbGci...
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "cart_token": "550e8400-...",
        "user_id": null,
        "product_id": "42",
        "variation_id": "201",
        "quantity": "2",
        "meta": null,
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-01-15 10:31:00",
        "product_name": "Nike Air Max 90",
        "product_image": "https://example.com/wp-content/uploads/2024/01/nike-air-max.jpg",
        "price": "99.99"
      }
    ],
    "cart_token": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Cart Item Fields

Each item in the `items` array contains the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique row ID of the cart item |
| `cart_token` | string | Cart session token (empty for authenticated users) |
| `user_id` | integer \| null | WP user ID (null for guests) |
| `product_id` | string | WooCommerce product ID |
| `variation_id` | string | Product variation ID (0 for simple products) |
| `quantity` | string | Number of units in the cart |
| `meta` | string \| null | JSON-encoded custom metadata |
| `created_at` | string | ISO 8601 timestamp when item was added |
| `updated_at` | string | ISO 8601 timestamp of last modification |
| `product_name` | string | Human-readable product name (e.g., "Nike Air Max 90") |
| `product_image` | string \| null | Primary image URL from the product (null if no image exists) |
| `price` | string | Current product price (e.g., `"99.99"`; `"0"` if unavailable) |

---

### 7.3 Update Cart Item

**`PUT /wp-json/wpadhlwrapi/v1/cart/update`**

Sets the absolute quantity of a line item. Requires a valid Bearer token.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `item_id` | integer | ✅ | Row ID from cart items (`data.items[].id`) |
| `quantity` | integer | ✅ | New quantity (minimum 1) |

#### Example Request

```
PUT /wp-json/wpadhlwrapi/v1/cart/update
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{ "item_id": 1, "quantity": 3 }
```

#### Example Response

Same shape as Get Cart response — full updated cart.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `authentication_required` | 401 | No Authorization header |
| `cart_item_not_found` | 404 | `item_id` does not exist |
| `out_of_stock` | 400 | Insufficient stock for new quantity |

---

### 7.4 Remove Cart Item

**`DELETE /wp-json/wpadhlwrapi/v1/cart/remove`**

Removes a single line item. Requires a valid Bearer token.

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `item_id` | integer | ✅ | Row ID of the item to remove |

#### Example Request

```
DELETE /wp-json/wpadhlwrapi/v1/cart/remove
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{ "item_id": 1 }
```

#### Example Response

Same shape as Get Cart response — updated cart without the removed item.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `authentication_required` | 401 | No Authorization header |
| `cart_remove_failed` | 404 | `item_id` does not exist |

---

### 7.5 AI-Friendly: Cart

**When to use each endpoint:**
- `POST /cart/add` — user clicks "Add to Cart" or "Buy Now"
- `GET /cart` — render cart sidebar/drawer, cart page
- `PUT /cart/update` — user changes quantity in cart
- `DELETE /cart/remove` — user removes an item

**Guest Cart Flow:**
1. User adds item (no token) → `POST /cart/add` → save `guest_token` in `localStorage`
2. All subsequent cart calls → `Authorization: Bearer <guest_token>`
3. User logs in → include `guest_cart_token: <guest_token>` in login body → cart merged automatically

**Next.js Example:**

```typescript
// lib/api/cart.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json/wpadhlwrapi/v1';

function getCartToken(): string | null {
  return localStorage.getItem('cart_token'); // guest_token or access_token
}

export async function addToCart(productId: number, variationId = 0, quantity = 1) {
  const token = getCartToken();
  const res = await fetch(`${API_BASE}/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ product_id: productId, variation_id: variationId, quantity }),
  });
  const json = await res.json();
  // On first add, save the guest token
  if (json.data?.guest_token) {
    localStorage.setItem('cart_token', json.data.guest_token);
  }
  return json;
}

export async function getCart() {
  const token = getCartToken();
  const res = await fetch(`${API_BASE}/cart`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export async function updateCartItem(itemId: number, quantity: number) {
  const res = await fetch(`${API_BASE}/cart/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getCartToken()}`,
    },
    body: JSON.stringify({ item_id: itemId, quantity }),
  });
  return res.json();
}

export async function removeCartItem(itemId: number) {
  const res = await fetch(`${API_BASE}/cart/remove`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getCartToken()}`,
    },
    body: JSON.stringify({ item_id: itemId }),
  });
  return res.json();
}
```

---

## 8. Checkout

Checkout requires a valid **user** access token (not a guest token). The user's cart in `wp_hl_cart` must have at least one item.

### 8.1 Place Order

**`POST /wp-json/api/checkout`**

Creates a WooCommerce order from the user's cart, validates stock, and processes payment.

**Requires:** `Authorization: Bearer <access_token>`

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `gateway` | string | ✅ | Payment gateway slug: `"stripe"` or `"bacs"` |
| `payment_data` | object | — | Gateway-specific data (see below) |
| `billing` | object | — | Billing address fields |
| `shipping` | object | — | Shipping address (defaults to billing if omitted) |

**`payment_data` for `stripe`:**
```json
{ "payment_method_id": "pm_card_visa" }
```

**`payment_data` for `bacs`:**
```json
{}
```

**Address object fields:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "company": "",
  "address_1": "123 Main St",
  "address_2": "",
  "city": "New York",
  "state": "NY",
  "postcode": "10001",
  "country": "US",
  "email": "jane@example.com",
  "phone": "+1-555-0100"
}
```

> `email` and `phone` are only used for billing; they are ignored in the `shipping` object.

#### Example Request — Stripe

```
POST /wp-json/api/checkout
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "gateway": "stripe",
  "payment_data": { "payment_method_id": "pm_card_visa" },
  "billing": {
    "first_name": "Jane", "last_name": "Doe",
    "address_1": "123 Main St", "city": "New York",
    "state": "NY", "postcode": "10001", "country": "US",
    "email": "jane@example.com", "phone": "+1-555-0100"
  }
}
```

#### Example Response — Stripe Success

```json
{
  "success": true,
  "data": {
    "order_id": 42,
    "status": "completed",
    "transaction_id": "pi_3abc123def456"
  }
}
```

#### Example Response — BACS Success

```json
{
  "success": true,
  "data": {
    "order_id": 43,
    "status": "pending",
    "transaction_id": null
  }
}
```

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `invalid_token` | 401 | Missing or invalid Bearer token |
| `empty_cart` | 400 | No items in user's cart |
| `unknown_gateway` | 400 | Gateway slug not registered |
| `out_of_stock` | 400 | One or more cart items out of stock |
| `order_creation_failed` | 500 | `wc_create_order()` error |
| `payment_failed` | 402 | Gateway declined the payment |

---

### 8.2 AI-Friendly: Checkout

**Typical Checkout Flow:**
1. Guest adds items → receives `guest_token`
2. Guest is ready to checkout → `POST /auth/login` with `guest_cart_token` → receives `access_token` (guest cart merged)
3. Collect billing address + payment method from checkout form
4. Create Stripe `PaymentMethod` client-side → get `pm_*` ID
5. `POST /api/checkout` with `gateway: "stripe"`, `payment_data: { payment_method_id }`, billing/shipping → order created, payment charged
6. On success → redirect to order confirmation page using `order_id`

**Next.js Example:**

```typescript
// lib/api/checkout.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json';

export async function login(username: string, password: string, guestToken?: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      ...(guestToken && { guest_cart_token: guestToken }),
    }),
  });
  const json = await res.json();
  if (json.success) {
    localStorage.setItem('access_token', json.data.access_token);
    localStorage.setItem('refresh_token', json.data.refresh_token);
  }
  return json;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const json = await res.json();
  if (json.success) {
    localStorage.setItem('access_token', json.data.token);
  }
  return json;
}

export async function placeOrder(payload: {
  gateway: 'stripe' | 'bacs';
  payment_data?: Record<string, string>;
  billing: Record<string, string>;
  shipping?: Record<string, string>;
}) {
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

**Stripe + Next.js Integration:**

```typescript
// components/CheckoutForm.tsx — using @stripe/stripe-js
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(billing: Record<string, string>) {
    // 1. Create PaymentMethod client-side
    const { paymentMethod, error } = await stripe!.createPaymentMethod({
      type: 'card',
      card: elements!.getElement(CardElement)!,
    });
    if (error || !paymentMethod) return; // show error

    // 2. Send to backend
    const result = await placeOrder({
      gateway: 'stripe',
      payment_data: { payment_method_id: paymentMethod.id },
      billing,
    });

    if (result.success) {
      // 3. Redirect to confirmation
      router.push(`/order-confirmation/${result.data.order_id}`);
    }
  }
}
```

---

## 9. Orders

### 9.1 List Orders

**`GET /wp-json/api/orders`**

Returns a paginated list of the authenticated user's WooCommerce orders.

**Requires:** `Authorization: Bearer <access_token>`

#### Query Parameters

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | `1` | — | Page number |
| `per_page` | integer | `10` | `100` | Orders per page |

#### Example Request

```
GET /wp-json/api/orders?page=1&per_page=5
Authorization: Bearer eyJhbGci...
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "status": "processing",
      "currency": "USD",
      "total": "99.00",
      "date_created": "2024-01-15T10:30:00+00:00",
      "line_items": [
        {
          "product_id": 7,
          "name": "Classic Crew Neck Tee — Red / S",
          "quantity": 2,
          "line_total": "59.98"
        },
        {
          "product_id": 12,
          "name": "Canvas Tote Bag",
          "quantity": 1,
          "line_total": "39.02"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 5,
    "total": 12,
    "total_pages": 3
  }
}
```

#### Notes

- Orders are returned in **descending date order** (newest first).
- `product_id` always reflects the **parent product ID**, even for variation line items — useful for building product links.
- `date_created` is ISO 8601 with timezone offset; `null` for orders missing this data.
- Shipping, fee, and tax line items are excluded — only product lines are returned.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `invalid_token` | 401 | Missing, expired, or invalid Bearer token |
| `rest_invalid_param` | 400 | `per_page` > 100 |

---

### 9.2 AI-Friendly: Orders

**When to use:**
- Account page → "My Orders" tab
- Post-checkout confirmation page → show order details

**Typical Flow:**
1. User navigates to account → `GET /api/orders?per_page=10` → render order list
2. User clicks an order → use the `id` to link to a WooCommerce order detail page or build a dedicated endpoint

**Next.js Example:**

```typescript
// lib/api/orders.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json/api';

export async function getOrders(page = 1, perPage = 10) {
  const res = await fetch(`${API_BASE}/orders?page=${page}&per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json(); // { success, data, meta }
}

// React component usage
export function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total_pages: 1 });

  useEffect(() => {
    getOrders(meta.page).then(({ data, meta }) => {
      setOrders(data);
      setMeta(meta);
    });
  }, [meta.page]);

  return (
    <div>
      {orders.map((order) => (
        <div key={order.id}>
          <h3>Order #{order.id}</h3>
          <p>Status: {order.status} | Total: {order.currency} {order.total}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Customer (User Profile)

### 10.1 Get Profile

**`GET /wp-json/api/user`**

Returns the authenticated user's profile including WooCommerce billing and shipping addresses.

**Requires:** `Authorization: Bearer <access_token>`

#### Example Request

```
GET /wp-json/api/user
Authorization: Bearer eyJhbGci...
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "jane@example.com",
    "display_name": "Jane Doe",
    "first_name": "Jane",
    "last_name": "Doe",
    "billing": {
      "first_name": "Jane",
      "last_name": "Doe",
      "company": "",
      "address_1": "123 Main St",
      "address_2": "",
      "city": "New York",
      "state": "NY",
      "postcode": "10001",
      "country": "US",
      "email": "jane@example.com",
      "phone": "+1-555-0100"
    },
    "shipping": {
      "first_name": "Jane",
      "last_name": "Doe",
      "company": "",
      "address_1": "123 Main St",
      "address_2": "",
      "city": "New York",
      "state": "NY",
      "postcode": "10001",
      "country": "US"
    }
  }
}
```

#### Notes

- All address fields are always present; unset fields return an empty string `""`.
- `billing.email` may differ from the account `email` — customers may use different billing contact email.
- `shipping` does not contain `email` or `phone` — WooCommerce convention.
- Raw WordPress internal meta keys (`wp_capabilities`, `session_tokens`, etc.) are never exposed.

#### Error Cases

| Code | HTTP | Condition |
|---|---|---|
| `invalid_token` | 401 | Missing or invalid Bearer token |
| `user_not_found` | 404 | JWT is valid but the user account was deleted |

---

### 10.2 AI-Friendly: Customer

**When to use:**
- Account/profile page — display user info and addresses
- Pre-filling checkout form — load saved billing/shipping address from `GET /api/user`

**Typical Flow:**
1. User opens account page → `GET /api/user` → display profile fields
2. User opens checkout → `GET /api/user` → pre-fill billing/shipping form fields
3. User submits checkout → send updated address in `billing`/`shipping` body of `POST /api/checkout`

**Next.js Example:**

```typescript
// lib/api/user.ts
export async function getUserProfile() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/api/user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  const { data } = await res.json();
  return data; // { id, email, display_name, billing, shipping }
}

// Pre-fill checkout form
export function CheckoutPage() {
  const [billing, setBilling] = useState({});

  useEffect(() => {
    getUserProfile().then((user) => setBilling(user.billing));
  }, []);

  // ... render form pre-filled with billing
}
```

---

## 11. Error Reference

### HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request — validation failure, stock error, unknown gateway, empty cart |
| `401` | Unauthorized — missing, invalid, or expired token |
| `402` | Payment failed — gateway declined |
| `404` | Not found — product slug, cart item, or user |
| `500` | Server error — database or order creation failure |

### Error Codes by Module

#### Auth

| Code | Trigger |
|---|---|
| `invalid_credentials` | Wrong username/password on login |
| `email_exists` | Registration attempted with an already-registered email |
| `registration_failed` | `wp_insert_user()` returned an error during registration |
| `invalid_reset_key` | Password reset key is invalid, expired, or login mismatch |
| `jwt_expired` | Access or refresh token has expired |
| `jwt_invalid_signature` | Token was tampered with |
| `jwt_invalid` | Token is malformed or corrupt |
| `invalid_token` | JwtMiddleware catch-all for protected routes |
| `missing_token` | Authorization header absent on protected route |
| `malformed_token` | Authorization header present but not `Bearer <token>` format |

#### Products

| Code | Trigger |
|---|---|
| `product_not_found` | Slug doesn't exist, product is draft, or product is private |

#### Cart

| Code | Trigger |
|---|---|
| `out_of_stock` | Product out of stock or insufficient quantity |
| `authentication_required` | update/remove called without a Bearer token |
| `cart_item_not_found` | `item_id` doesn't exist in cart |
| `cart_add_failed` | Database insert/update failed |
| `cart_update_failed` | Database update failed |
| `cart_remove_failed` | Row not found or delete failed |
| `invalid_guest_token` | Guest JWT missing `cart_token` claim |

#### Checkout

| Code | Trigger |
|---|---|
| `empty_cart` | No cart items for the authenticated user |
| `unknown_gateway` | Gateway slug not registered in the adapter registry |
| `out_of_stock` | Hard stock check failed (same code as cart) |
| `order_creation_failed` | `wc_create_order()` returned WP_Error |
| `payment_failed` | Adapter returned `success: false` |

#### User / Orders

| Code | Trigger |
|---|---|
| `user_not_found` | JWT valid but user account deleted |

---

## 12. Complete Typical Flows

### Flow A — Guest Purchase (Stripe)

```
1.  GET  /wpadhlwrapi/v1/products?category=shoes
      → display product listing

2.  GET  /wpadhlwrapi/v1/products/nike-air-max
      → display PDP, load all variations

3.  POST /wpadhlwrapi/v1/cart/add          (no auth header)
      body: { product_id: 42, variation_id: 201 }
      → save guest_token to localStorage
      → save cart_token to localStorage

4.  GET  /wpadhlwrapi/v1/cart              (Bearer guest_token)
      → render cart sidebar

5.  PUT  /wpadhlwrapi/v1/cart/update       (Bearer guest_token)
      body: { item_id: 1, quantity: 2 }
      → update quantity

6.  POST /api/auth/login
      body: { username, password, guest_cart_token: <guest_token> }
      → save access_token to localStorage
      → guest cart merged automatically

7.  GET  /api/user                         (Bearer access_token)
      → pre-fill checkout billing form

8.  [Client] Stripe.createPaymentMethod() → pm_abc123

9.  POST /api/checkout                     (Bearer access_token)
      body: { gateway: "stripe", payment_data: { payment_method_id: "pm_abc123" }, billing: {...} }
      → 200 { order_id: 42, status: "completed", transaction_id: "pi_xyz" }

10. Redirect to /order-confirmation/42
```

---

### Flow B — Returning User Purchase (BACS)

```
1.  POST /api/auth/login  →  save access_token
2.  GET  /wpadhlwrapi/v1/cart (Bearer access_token)  →  existing cart (if any)
3.  POST /wpadhlwrapi/v1/cart/add  (Bearer access_token)  →  add item
4.  POST /api/checkout
      body: { gateway: "bacs", billing: {...} }
      → 200 { order_id: 43, status: "pending", transaction_id: null }
5.  Show bank transfer instructions page with order #43
```

---

### Flow C — Browse Without Buying

```
1.  GET /wpadhlwrapi/v1/products
2.  GET /wpadhlwrapi/v1/products/{slug}
    → No authentication needed at any step
```

---

### Flow D — Account Page

```
1.  GET /api/user    (Bearer access_token)  →  profile data
2.  GET /api/orders  (Bearer access_token)  →  order history
```

---

### Flow E — New Customer Registration

```
1.  POST /api/auth/register
      body: { email, password, first_name, last_name }
      → 201 { access_token, refresh_token, expires_in, user }
      → save access_token to localStorage
      → redirect to account/home page (user is immediately authenticated)
```

---

### Flow F — Forgot / Reset Password

```
1.  POST /api/auth/forgot-password
      body: { email }
      → 200 { message: "If an account exists..." }
      → show "Check your email" message on frontend

2.  User clicks link in email:
      https://my-nextjs-app.com/reset-password?key=abc123&login=janedoe

3.  Frontend extracts key and login from URL params
    User enters new password

4.  POST /api/auth/reset-password
      body: { key: "abc123", login: "janedoe", new_password: "newSecurePass1" }
      → 200 { message: "Your password has been updated." }
      → redirect to /login page
```

---

## 13. Environment Configuration

### Required WordPress Constants (add to `wp-config.php`)

```php
// JWT secret — set this to a long random string for production
define( 'HL_WRAPI_JWT_SECRET', 'your-64-character-random-secret-here' );

// Stripe secret key (alternative to storing in plugin settings)
define( 'HL_WRAPI_STRIPE_SECRET_KEY', 'sk_live_...' );
```

If `HL_WRAPI_JWT_SECRET` is not defined, the plugin falls back to WordPress's `AUTH_KEY`. If `HL_WRAPI_STRIPE_SECRET_KEY` is not defined, the key is read from the `wpadhlwrapi_stripe_secret_key` database option (plugin settings page).

### Next.js Environment Variables

```env
# .env.local
NEXT_PUBLIC_WP_URL=https://your-wp-site.com

# Server-only (for Next.js API routes / server components)
WP_URL=https://your-wp-site.com
```

### CORS

If your Next.js app is on a different domain, WordPress needs CORS headers. Add to your theme's `functions.php` or a utility plugin:

```php
add_filter( 'rest_pre_serve_request', function( $served, $result, $request ) {
    header( 'Access-Control-Allow-Origin: https://your-nextjs-site.com' );
    header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
    header( 'Access-Control-Allow-Headers: Authorization, Content-Type' );
    return $served;
}, 10, 3 );
```

### Apache + CGI Note

If the `Authorization` header is not reaching PHP (common in Apache + CGI/FastCGI setups), add to `.htaccess`:

```apache
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

---

## Maintenance Rule

This document must be updated whenever:

- A new endpoint is added or removed
- An endpoint's URL, method, or required auth changes
- Request parameters or response fields change
- Error codes or HTTP status codes change
- A new payment gateway is built in

Update the relevant section, add the endpoint to the [Complete Typical Flows](#11-complete-typical-flows) if it belongs to a user journey, and update the [Error Reference](#10-error-reference) for any new error codes.
