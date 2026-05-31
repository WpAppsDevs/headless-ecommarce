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
11. [Wishlist](#11-wishlist)
12. [Store Settings](#12-store-settings)
13. [Shop Filter Endpoints](#13-shop-filter-endpoints)
14. [Reviews](#14-reviews)
15. [Error Reference](#15-error-reference)
16. [Complete Typical Flows](#16-complete-typical-flows)
17. [Environment Configuration](#17-environment-configuration)

---

## 1. API Overview

This plugin exposes WooCommerce data through a stateless REST API designed for headless frontends. Key characteristics:

- **Stateless:** No cookies, no PHP sessions, no WooCommerce cart sessions.
- **JWT authentication:** Access tokens (1 hour) + refresh tokens (14 days). Guest shoppers receive a separate guest JWT for cart persistence.
- **Custom cart table:** All cart state is stored in `wp_hl_cart` — independent of WooCommerce's session-based cart.
- **Normalizer pattern:** All responses are explicitly whitelisted — no raw WordPress/WooCommerce internal fields are ever exposed.
- **Service layer:** Business logic lives in dedicated `*Service` classes (`AuthService`, `CartService`, `UserService`). Controllers are thin request/response adapters — they validate params, call the service or query WooCommerce directly, and return the envelope.
- **Centralised route registry:** All REST routes are declared in `routes/*.php` files loaded by `Core\Router`. Controllers no longer call `register_rest_route()` themselves.
- **Extensible payment layer:** New payment gateways can be added via a WordPress filter without modifying plugin code.

---

## 2. Base URL & Namespaces

```
Base: https://your-wp-site.com/wp-json
```

| Namespace | Full Base URL | Used For |
|---|---|---|
| `wpadhlwrapi/v1` | `/wp-json/wpadhlwrapi/v1/` | Products, Cart, Store Settings, Reviews (public reads) |
| `api` | `/wp-json/api/` | Auth, Checkout, Orders, User, Reviews (mutations) |

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
| `/api/wishlist` | `GET`, `POST`, `DELETE /api/wishlist`, `GET /api/wishlist/check/{product_id}` |

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
| `brand` | string | — | Filter by brand slug (`product_brand` taxonomy) |
| `tag` | string | — | Filter by product tag slug |
| `color` | string | — | Filter by color attribute slug (`pa_color` taxonomy) |
| `size` | string | — | Filter by size attribute slug (`pa_size` taxonomy) |
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
      "date_created": "2024-01-15T10:30:00",
      "date_created_gmt": "2024-01-15T10:30:00",
      "date_modified": "2024-06-01T08:00:00",
      "date_modified_gmt": "2024-06-01T08:00:00",
      "type": "variable",
      "status": "publish",
      "featured": false,
      "catalog_visibility": "visible",
      "description": "<p>Premium cotton t-shirt...</p>",
      "short_description": "Everyday essential.",
      "sku": "TEE-001",
      "price": "29.99",
      "regular_price": "34.99",
      "sale_price": "29.99",
      "date_on_sale_from": null,
      "date_on_sale_from_gmt": null,
      "date_on_sale_to": null,
      "date_on_sale_to_gmt": null,
      "price_html": "<span class=\"woocommerce-Price-amount\">$29.99</span>",
      "on_sale": true,
      "purchasable": true,
      "total_sales": 134,
      "virtual": false,
      "downloadable": false,
      "downloads": [],
      "download_limit": -1,
      "download_expiry": -1,
      "external_url": "",
      "button_text": "",
      "tax_status": "taxable",
      "tax_class": "",
      "manage_stock": false,
      "stock_quantity": null,
      "stock_status": "instock",
      "backorders": "no",
      "backorders_allowed": false,
      "backordered": false,
      "sold_individually": false,
      "weight": "0.3",
      "dimensions": { "length": "30", "width": "25", "height": "2" },
      "shipping_required": true,
      "shipping_taxable": true,
      "shipping_class": "",
      "shipping_class_id": 0,
      "reviews_allowed": true,
      "average_rating": "4.50",
      "rating_count": 22,
      "related_ids": [10, 11, 12],
      "upsell_ids": [],
      "cross_sell_ids": [],
      "parent_id": 0,
      "purchase_note": "",
      "categories": [
        { "id": 9, "name": "T-Shirts", "slug": "t-shirts" }
      ],
      "tags": [
        { "id": 3, "name": "Sale", "slug": "sale" }
      ],
      "images": [
        {
          "id": 101,
          "date_created": "2024-01-15T10:28:00",
          "date_created_gmt": "2024-01-15T10:28:00",
          "date_modified": "2024-01-15T10:28:00",
          "date_modified_gmt": "2024-01-15T10:28:00",
          "src": "https://example.com/wp-content/uploads/tee-front.jpg",
          "name": "tee-front",
          "alt": "Tee front view"
        }
      ],
      "attributes": [
        {
          "id": 1,
          "name": "Size",
          "slug": "pa_size",
          "position": 0,
          "visible": true,
          "variation": true,
          "options": ["S", "M", "L", "XL"]
        }
      ],
      "default_attributes": [],
      "variations": [201, 202, 203],
      "grouped_products": []
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
    "permalink": "https://example.com/product/classic-crew-neck-tee/",
    "date_created": "2024-01-15T10:30:00",
    "date_created_gmt": "2024-01-15T10:30:00",
    "date_modified": "2024-06-01T08:00:00",
    "date_modified_gmt": "2024-06-01T08:00:00",
    "type": "variable",
    "status": "publish",
    "featured": false,
    "catalog_visibility": "visible",
    "description": "<p>Premium cotton t-shirt...</p>",
    "short_description": "Everyday essential.",
    "sku": "TEE-001",
    "price": "29.99",
    "regular_price": "34.99",
    "sale_price": "29.99",
    "date_on_sale_from": null,
    "date_on_sale_from_gmt": null,
    "date_on_sale_to": null,
    "date_on_sale_to_gmt": null,
    "price_html": "<span class=\"woocommerce-Price-amount\">$29.99</span>",
    "on_sale": true,
    "purchasable": true,
    "total_sales": 134,
    "virtual": false,
    "downloadable": false,
    "downloads": [],
    "download_limit": -1,
    "download_expiry": -1,
    "external_url": "",
    "button_text": "",
    "tax_status": "taxable",
    "tax_class": "",
    "manage_stock": false,
    "stock_quantity": null,
    "stock_status": "instock",
    "backorders": "no",
    "backorders_allowed": false,
    "backordered": false,
    "sold_individually": false,
    "weight": "0.3",
    "dimensions": { "length": "30", "width": "25", "height": "2" },
    "shipping_required": true,
    "shipping_taxable": true,
    "shipping_class": "",
    "shipping_class_id": 0,
    "reviews_allowed": true,
    "average_rating": "4.50",
    "rating_count": 22,
    "related_ids": [10, 11, 12],
    "upsell_ids": [],
    "cross_sell_ids": [],
    "parent_id": 0,
    "purchase_note": "",
    "categories": [{ "id": 9, "name": "T-Shirts", "slug": "t-shirts" }],
    "tags": [{ "id": 3, "name": "Sale", "slug": "sale" }],
    "images": [
      {
        "id": 101,
        "date_created": "2024-01-15T10:28:00",
        "date_created_gmt": "2024-01-15T10:28:00",
        "date_modified": "2024-01-15T10:28:00",
        "date_modified_gmt": "2024-01-15T10:28:00",
        "src": "https://example.com/wp-content/uploads/tee-front.jpg",
        "name": "tee-front",
        "alt": "Tee front view"
      }
    ],
    "attributes": [
      {
        "id": 1,
        "name": "Size",
        "slug": "pa_size",
        "position": 0,
        "visible": true,
        "variation": true,
        "options": ["S", "M", "L", "XL"]
      },
      {
        "id": 2,
        "name": "Color",
        "slug": "pa_color",
        "position": 1,
        "visible": true,
        "variation": true,
        "options": ["Red", "Blue", "White"]
      }
    ],
    "default_attributes": [
      { "id": 1, "name": "Size", "option": "M" }
    ],
    "variations": [
      {
        "id": 201,
        "date_created": "2024-01-15T10:31:00",
        "date_created_gmt": "2024-01-15T10:31:00",
        "date_modified": "2024-06-01T08:00:00",
        "date_modified_gmt": "2024-06-01T08:00:00",
        "description": "",
        "permalink": "https://example.com/product/classic-crew-neck-tee/?attribute_pa_size=S&attribute_pa_color=Red",
        "sku": "TEE-001-S-RED",
        "price": "29.99",
        "regular_price": "34.99",
        "sale_price": "29.99",
        "date_on_sale_from": null,
        "date_on_sale_from_gmt": null,
        "date_on_sale_to": null,
        "date_on_sale_to_gmt": null,
        "on_sale": true,
        "purchasable": true,
        "virtual": false,
        "downloadable": false,
        "downloads": [],
        "download_limit": -1,
        "download_expiry": -1,
        "tax_status": "taxable",
        "tax_class": "",
        "manage_stock": true,
        "stock_quantity": 15,
        "stock_status": "instock",
        "backorders": "no",
        "backorders_allowed": false,
        "backordered": false,
        "weight": "0.3",
        "dimensions": { "length": "30", "width": "25", "height": "2" },
        "shipping_class": "",
        "shipping_class_id": 0,
        "image": {
          "id": 102,
          "date_created": "2024-01-15T10:29:00",
          "date_created_gmt": "2024-01-15T10:29:00",
          "date_modified": "2024-01-15T10:29:00",
          "date_modified_gmt": "2024-01-15T10:29:00",
          "src": "https://example.com/wp-content/uploads/tee-red.jpg",
          "name": "tee-red",
          "alt": "Red tee"
        },
        "attributes": [
          { "id": 1, "name": "Size", "option": "S" },
          { "id": 2, "name": "Color", "option": "Red" }
        ]
      }
    ],
    "grouped_products": []
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
- `GET /products?brand=khaadi` — brand-specific listing pages
- `GET /products?tag=sale` — tag-filtered listing pages
- `GET /products?color=red&size=m` — attribute-filtered listing pages (sidebar filters)
- `GET /products/{slug}` — product detail page (PDP); use this instead of making separate variation requests

**Typical Flow:**
1. `GET /products?category=shoes&page=1&per_page=12` → render product grid
2. `GET /products?brand=khaadi&color=red&size=m` → render filtered listing
3. User clicks product → `GET /products/classic-kurta` → render PDP with all variation options pre-loaded
4. User selects a variation → read from `data.variations` array (no extra API call needed)
5. User adds to cart → `POST /wpadhlwrapi/v1/cart/add` with the selected `variation_id`

**Next.js Example:**

```typescript
// lib/api/products.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json/wpadhlwrapi/v1';

export interface ProductImage {
  id: number;
  date_created: string | null;
  date_created_gmt: string | null;
  date_modified: string | null;
  date_modified_gmt: string | null;
  src: string;
  name: string;
  alt: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface VariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface Variation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  image: ProductImage | null;
  attributes: VariationAttribute[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string | null;
  date_modified: string | null;
  type: string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  average_rating: string;
  rating_count: number;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  default_attributes: VariationAttribute[];
  variations: Variation[];
  grouped_products: number[];
}

export async function getProducts(params: {
  page?: number;
  per_page?: number;
  category?: string;
  brand?: string;
  tag?: string;
  color?: string;
  size?: string;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 12),
    ...(params.category && { category: params.category }),
    ...(params.brand && { brand: params.brand }),
    ...(params.tag && { tag: params.tag }),
    ...(params.color && { color: params.color }),
    ...(params.size && { size: params.size }),
    ...(params.search && { search: params.search }),
  });
  const res = await fetch(`${API_BASE}/products?${query}`);
  return res.json() as Promise<{ success: boolean; data: Product[]; meta: { page: number; total: number; total_pages: number } }>;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  if (res.status === 404) return null;
  const json = await res.json();
  return json.success ? json.data : null;
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
      "parent_id": 0,
      "number": "42",
      "order_key": "wc_order_abc123",
      "created_via": "checkout",
      "version": "8.0.0",
      "status": "processing",
      "currency": "USD",
      "date_created": "2024-01-15T10:30:00",
      "date_created_gmt": "2024-01-15T10:30:00",
      "date_modified": "2024-01-15T10:31:00",
      "date_modified_gmt": "2024-01-15T10:31:00",
      "discount_total": "5.00",
      "discount_tax": "0.00",
      "shipping_total": "10.00",
      "shipping_tax": "0.00",
      "cart_tax": "1.35",
      "total": "99.00",
      "total_tax": "1.35",
      "prices_include_tax": false,
      "customer_id": 7,
      "customer_ip_address": "127.0.0.1",
      "customer_user_agent": "Mozilla/5.0",
      "customer_note": "",
      "payment_method": "stripe",
      "payment_method_title": "Credit Card (Stripe)",
      "transaction_id": "pi_3abc123",
      "date_paid": "2024-01-15T10:30:45",
      "date_paid_gmt": "2024-01-15T10:30:45",
      "date_completed": null,
      "date_completed_gmt": null,
      "cart_hash": "e24df9c8b1d5fe6",
      "billing": {
        "first_name": "Jane",
        "last_name": "Doe",
        "company": "",
        "address_1": "123 Main St",
        "address_2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "country": "US",
        "email": "jane@example.com",
        "phone": "555-867-5309"
      },
      "shipping": {
        "first_name": "Jane",
        "last_name": "Doe",
        "company": "",
        "address_1": "123 Main St",
        "address_2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "country": "US"
      },
      "line_items": [
        {
          "id": 315,
          "name": "Classic Crew Neck Tee — Red / S",
          "product_id": 7,
          "variation_id": 201,
          "quantity": 2,
          "tax_class": "",
          "subtotal": "59.98",
          "subtotal_tax": "0.50",
          "total": "54.98",
          "total_tax": "0.46",
          "taxes": [{ "id": 9, "total": "0.46", "subtotal": "0.50" }],
          "sku": "TEE-001-S-RED",
          "price": 29.99,
          "image": "https://your-wp-site.com/wp-content/uploads/tee-red-300x300.jpg"
        }
      ],
      "tax_lines": [
        {
          "id": 318,
          "rate_code": "US-NY-STATE TAX",
          "rate_id": 9,
          "label": "State Tax",
          "compound": false,
          "tax_total": "0.85",
          "shipping_tax_total": "0.00"
        }
      ],
      "shipping_lines": [
        {
          "id": 316,
          "method_title": "Flat Rate",
          "method_id": "flat_rate",
          "total": "10.00",
          "total_tax": "0.00",
          "taxes": []
        }
      ],
      "fee_lines": [],
      "coupon_lines": [
        {
          "id": 320,
          "code": "SAVE5",
          "discount": "5.00",
          "discount_tax": "0.00"
        }
      ],
      "refunds": []
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
- All date fields (`date_created`, `date_modified`, `date_paid`, `date_completed`) are returned in both local WP-timezone (`*`) and UTC (`*_gmt`) variants. `null` when the event has not occurred.
- All price/total fields are decimal strings (e.g. `"10.00"`) to preserve precision.
- `payment_method` is the WooCommerce gateway slug (e.g. `"stripe"`, `"bacs"`); `payment_method_title` is the customer-facing label.
- `billing` contains 11 fields including `email` and `phone`; `shipping` contains 9 fields (no `email`/`phone` — WooCommerce convention).
- `line_items[].product_id` always reflects the **parent product ID**, even for variation line items — useful for building product page links.
- `line_items[].variation_id` is `0` for non-variation products.
- `line_items[].image` is the product thumbnail at `woocommerce_thumbnail` size. Falls back to the WC placeholder if no image is set; empty string `""` if the product was deleted.
- `tax_lines` contains one entry per tax rate applied to the order.
- `shipping_lines` contains one entry per shipping method applied to the order.
- `fee_lines` contains any manual or programmatic fees added to the order.
- `coupon_lines` contains one entry per coupon applied, with the discount amount.
- `refunds` contains any refunds applied; `total` is always a negative string (e.g. `"-10.00"`).
- `cart_hash` is the MD5 hash WooCommerce uses for cart session deduplication.

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

interface OrderAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string; // billing only
  phone?: string; // billing only
}

interface OrderItemTax {
  id: number;
  total: string;
  subtotal?: string;
}

interface OrderItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: OrderItemTax[];
  sku: string;
  price: number;
  image: string;
}

interface TaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
}

interface ShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  total: string;
  total_tax: string;
  taxes: { id: number; total: string }[];
}

interface FeeLine {
  id: number;
  name: string;
  tax_class: string;
  tax_status: string;
  total: string;
  total_tax: string;
  taxes: OrderItemTax[];
}

interface CouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
}

interface Refund {
  id: number;
  reason: string;
  total: string; // negative, e.g. "-10.00"
}

interface Order {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: string;
  currency: string;
  date_created: string | null;
  date_created_gmt: string | null;
  date_modified: string | null;
  date_modified_gmt: string | null;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_note: string;
  billing: OrderAddress;
  shipping: OrderAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string | null;
  date_paid_gmt: string | null;
  date_completed: string | null;
  date_completed_gmt: string | null;
  cart_hash: string;
  line_items: OrderItem[];
  tax_lines: TaxLine[];
  shipping_lines: ShippingLine[];
  fee_lines: FeeLine[];
  coupon_lines: CouponLine[];
  refunds: Refund[];
}

export async function getOrders(page = 1, perPage = 10) {
  const res = await fetch(`${API_BASE}/orders?page=${page}&per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json() as Promise<{ success: boolean; data: Order[]; meta: { page: number; per_page: number; total: number; total_pages: number } }>;
}

// React component usage
export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
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
          <h3>Order #{order.number}</h3>
          <p>
            Status: {order.status} | Total: {order.currency} {order.total} |
            Tax: {order.total_tax} | Shipping: {order.shipping_total}
          </p>
          {order.date_paid && <p>Paid: {new Date(order.date_paid).toLocaleDateString()}</p>}
          <p>Payment: {order.payment_method_title}</p>
          <p>
            Shipped to: {order.shipping.address_1}, {order.shipping.city},{' '}
            {order.shipping.country}
          </p>
          {order.coupon_lines.length > 0 && (
            <p>Coupons: {order.coupon_lines.map((c) => c.code).join(', ')} (−{order.discount_total})</p>
          )}
          <ul>
            {order.line_items.map((item) => (
              <li key={item.id}>
                {item.image && (
                  <img src={item.image} alt={item.name} width={60} height={60} />
                )}
                {item.name} × {item.quantity} — {order.currency} {item.total}
              </li>
            ))}
          </ul>
          {order.refunds.length > 0 && (
            <p>Refunded: {order.currency} {order.refunds.reduce((s, r) => s + Math.abs(parseFloat(r.total)), 0).toFixed(2)}</p>
          )}
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

## 11. Wishlist

All wishlist endpoints require a valid `Authorization: Bearer <access_token>` header.
The authenticated user is resolved from the JWT — no session or cookie is involved.

### 11.1 Get Wishlist Products

```
GET /wp-json/api/wishlist
```

Returns a paginated list of normalized WooCommerce products in the current user's wishlist.

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (1-indexed). |
| `per_page` | integer | 20 | Items per page (max 100). |

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "Wireless Headphones",
      "slug": "wireless-headphones",
      "price": "99.00",
      "regular_price": "129.00",
      "sale_price": "99.00",
      "images": [ { "src": "https://..." } ]
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 3,
    "total_pages": 1,
    "count": 3
  }
}
```

**Empty wishlist — HTTP 200**

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "per_page": 20, "total": 0, "total_pages": 0, "count": 0 }
}
```

---

### 11.2 Toggle Wishlist (Add / Remove)

```
POST /wp-json/api/wishlist
```

Adds the product if it is **not** in the wishlist; removes it if it **is**. Returns the new state in one round-trip — ideal for heart/bookmark buttons.

**Request Body**

```json
{ "product_id": 42 }
```

**Success Response — HTTP 200 (added)**

```json
{
  "success": true,
  "data": {
    "in_wishlist": true,
    "count": 4
  }
}
```

**Success Response — HTTP 200 (removed)**

```json
{
  "success": true,
  "data": {
    "in_wishlist": false,
    "count": 3
  }
}
```

**Error — product not found — HTTP 404**

```json
{
  "code": "product_not_found",
  "message": "Product not found or is not available.",
  "data": { "status": 404 }
}
```

---

### 11.3 Remove from Wishlist

```
DELETE /wp-json/api/wishlist/{product_id}
```

Removes the product from the wishlist. Idempotent — returns HTTP 200 even if the product was not in the wishlist.

**URL Parameters**

| Parameter | Type | Description |
|---|---|---|
| `product_id` | integer | WooCommerce product ID. |

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": {
    "product_id": 42,
    "in_wishlist": false,
    "count": 3
  }
}
```

---

### 11.4 Check Wishlist Status

```
GET /wp-json/api/wishlist/check/{product_id}
```

Lightweight check — returns whether a product is in the wishlist and the total count. No product data is fetched, making this fast for UI badges and icon states.

**URL Parameters**

| Parameter | Type | Description |
|---|---|---|
| `product_id` | integer | WooCommerce product ID. |

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": {
    "product_id": 42,
    "in_wishlist": true,
    "count": 4
  }
}
```

---

### 11.5 AI-Friendly: Wishlist

```
MODULE: Wishlist
NAMESPACE: api
AUTH: Bearer JWT required on all endpoints

ENDPOINTS:
  GET    /api/wishlist                    → get_items()    → Response::list()
  POST   /api/wishlist                    → toggle_item()  → Response::success()
  DELETE /api/wishlist/{product_id}       → remove_item()  → Response::success()
  GET    /api/wishlist/check/{product_id} → check_item()   → Response::success()

CLASSES:
  WishlistController   → routes/wishlist.php   → thin adapter, calls WishlistService
  WishlistService      → business logic, product validation, N+1-free retrieval
  WishlistRepository   → $wpdb CRUD against wp_user_wishlist_products

TABLE: wp_user_wishlist_products
  id BIGINT PK
  user_id BIGINT NOT NULL
  product_id BIGINT NOT NULL
  created_at DATETIME
  UNIQUE KEY (user_id, product_id)

KEY BEHAVIOURS:
  • POST uses toggle semantics (add if absent, remove if present)
  • INSERT IGNORE prevents duplicate inserts at DB level
  • N+1 prevention: IDs fetched in 1 query; products loaded via wc_get_products(include:[...])
  • Product validation checks wc_get_product() + post_status=publish before writing
  • DELETE is idempotent — no 404 on missing entry
```

---

## 12. Store Settings

No authentication required. Returns read-only store configuration grouped by concern.

### 12.1 Get Store Settings

```
GET /wp-json/wpadhlwrapi/v1/store-settings
```

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": {
    "currency": {
      "code": "USD",
      "symbol": "$",
      "position": "left",
      "decimal_separator": ".",
      "thousand_separator": ",",
      "num_decimals": 2
    },
    "store": {
      "name": "My Store",
      "description": "The best store around.",
      "url": "https://mystore.com",
      "country": "US",
      "state": "CA",
      "address": "123 Main St",
      "address_2": "",
      "city": "Los Angeles",
      "postcode": "90001",
      "timezone": "America/Los_Angeles",
      "locale": "en_US"
    },
    "tax": {
      "enabled": true,
      "display_shop": "incl",
      "display_cart": "incl",
      "include_in_price": true
    },
    "shipping": {
      "enabled": true,
      "free_shipping_available": false
    },
    "catalog": {
      "per_page": 12,
      "default_sort": "menu_order",
      "reviews_enabled": true,
      "ratings_enabled": true
    }
  }
}
```

**Field Reference**

| Field | Type | Source WooCommerce Option |
|---|---|---|
| `currency.code` | string | `woocommerce_currency` |
| `currency.symbol` | string | Derived via `get_woocommerce_currency_symbol()` |
| `currency.position` | string | `woocommerce_currency_pos` (`left`, `right`, `left_space`, `right_space`) |
| `currency.decimal_separator` | string | `woocommerce_price_decimal_sep` |
| `currency.thousand_separator` | string | `woocommerce_price_thousand_sep` |
| `currency.num_decimals` | integer | `woocommerce_price_num_decimals` |
| `store.name` | string | `blogname` |
| `store.description` | string | `blogdescription` |
| `store.url` | string | `home` |
| `store.country` | string | `woocommerce_default_country` (parsed — `CC` part) |
| `store.state` | string | `woocommerce_default_country` (parsed — `STATE` part) |
| `store.address` | string | `woocommerce_store_address` |
| `store.address_2` | string | `woocommerce_store_address_2` |
| `store.city` | string | `woocommerce_store_city` |
| `store.postcode` | string | `woocommerce_store_postcode` |
| `store.timezone` | string | WordPress timezone string |
| `store.locale` | string | `WPLANG` constant (fallback `en_US`) |
| `tax.enabled` | boolean | `woocommerce_calc_taxes` |
| `tax.display_shop` | string | `woocommerce_tax_display_shop` |
| `tax.display_cart` | string | `woocommerce_tax_display_cart` |
| `tax.include_in_price` | boolean | `woocommerce_prices_include_tax` |
| `shipping.enabled` | boolean | WC shipping modules active |
| `shipping.free_shipping_available` | boolean | Any enabled free-shipping zone method |
| `catalog.per_page` | integer | `posts_per_page` |
| `catalog.default_sort` | string | `woocommerce_default_catalog_orderby` |
| `catalog.reviews_enabled` | boolean | `woocommerce_enable_reviews` |
| `catalog.ratings_enabled` | boolean | `woocommerce_enable_review_rating` |

**Error Response — HTTP 500**

```json
{
  "success": false,
  "code": "settings_unavailable",
  "message": "Could not load store settings."
}
```

**Next.js Usage Example**

```ts
// lib/api/store-settings.ts
export async function getStoreSettings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wpadhlwrapi/v1/store-settings`, {
    next: { revalidate: 3600 }, // cache for 1 hour — settings rarely change
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}
```

---

## 13. Shop Filter Endpoints

All four filter endpoints are fully public (no authentication required) and are designed to power the headless shop sidebar. Responses are cached with 6-hour transients and automatically invalidated on any term change.

> **Brand taxonomy note:** Brands (`product_brand`) are a custom taxonomy — NOT a WooCommerce product attribute. They are served by `/product-brands` and intentionally excluded from `/product-attributes`.

---

### 13.1 Product Categories

```
GET /wp-json/wpadhlwrapi/v1/product-categories
```

Returns all WooCommerce product categories.

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `hide_empty` | boolean | `true` | Only return categories that have products |
| `per_page` | integer | `100` | Maximum results |
| `parent` | integer | — | Filter by parent category ID (for nested categories) |

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 30,
      "name": "Women",
      "slug": "women",
      "parent": 0,
      "description": "",
      "count": 45,
      "image": "https://example.com/wp-content/uploads/women.jpg"
    },
    {
      "id": 31,
      "name": "Kurta",
      "slug": "kurta",
      "parent": 30,
      "description": "",
      "count": 18,
      "image": null
    }
  ],
  "meta": {
    "total": 2
  }
}
```

---

### 13.2 Product Tags

```
GET /wp-json/wpadhlwrapi/v1/product-tags
```

Returns all WooCommerce product tags.

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `hide_empty` | boolean | `true` | Only tags with at least 1 product |
| `per_page` | integer | `100` | Maximum results |

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": [
    { "id": 41, "name": "Ready Stock", "slug": "ready-stock", "count": 12 },
    { "id": 42, "name": "Pre-Order",   "slug": "pre-order",   "count": 7  }
  ],
  "meta": {
    "total": 2
  }
}
```

---

### 13.3 Product Brands

```
GET /wp-json/wpadhlwrapi/v1/product-brands
```

Returns all terms from the `product_brand` custom taxonomy.

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `hide_empty` | boolean | `true` | Only brands with at least 1 product |
| `per_page` | integer | `100` | Maximum results |

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 51,
      "name": "Khaadi",
      "slug": "khaadi",
      "count": 6,
      "image": "https://example.com/wp-content/uploads/khaadi-logo.jpg"
    },
    {
      "id": 52,
      "name": "Gul Ahmed",
      "slug": "gul-ahmed",
      "count": 4,
      "image": null
    }
  ],
  "meta": {
    "total": 2
  }
}
```

> `image` is read from the `thumbnail_id` term meta (same pattern as `product_cat`). Returns `null` if no image is set.

---

### 13.4 Product Attributes

```
GET /wp-json/wpadhlwrapi/v1/product-attributes
```

Returns all registered WooCommerce product attribute taxonomies (e.g. `pa_color`, `pa_size`) with their terms grouped per attribute. `product_brand` is intentionally excluded.

**Query Parameters**

None.

**Success Response — HTTP 200**

```json
{
  "success": true,
  "data": {
    "pa_color": {
      "id": 1,
      "name": "Color",
      "slug": "pa_color",
      "terms": [
        { "id": 10, "name": "Red",   "slug": "red",   "count": 5 },
        { "id": 11, "name": "Black", "slug": "black", "count": 8 }
      ]
    },
    "pa_size": {
      "id": 2,
      "name": "Size",
      "slug": "pa_size",
      "terms": [
        { "id": 20, "name": "S",  "slug": "s",  "count": 10 },
        { "id": 21, "name": "M",  "slug": "m",  "count": 14 },
        { "id": 22, "name": "L",  "slug": "l",  "count": 12 },
        { "id": 23, "name": "XL", "slug": "xl", "count": 9  }
      ]
    }
  }
}
```

---

### 13.5 Next.js Usage Example

```typescript
// lib/api/catalog.ts
const API_BASE = process.env.NEXT_PUBLIC_WP_URL + '/wp-json/wpadhlwrapi/v1';

const CACHE_OPTIONS = { next: { revalidate: 21600 } }; // 6 hours — matches server-side transient TTL

export async function getProductCategories(params?: { hide_empty?: boolean; per_page?: number; parent?: number }) {
  const query = new URLSearchParams();
  if (params?.hide_empty === false) query.set('hide_empty', 'false');
  if (params?.per_page) query.set('per_page', String(params.per_page));
  if (params?.parent != null) query.set('parent', String(params.parent));
  const res = await fetch(`${API_BASE}/product-categories?${query}`, CACHE_OPTIONS);
  const json = await res.json();
  return json.data as { id: number; name: string; slug: string; parent: number; count: number; image: string | null }[];
}

export async function getProductTags() {
  const res = await fetch(`${API_BASE}/product-tags`, CACHE_OPTIONS);
  const json = await res.json();
  return json.data as { id: number; name: string; slug: string; count: number }[];
}

export async function getProductBrands() {
  const res = await fetch(`${API_BASE}/product-brands`, CACHE_OPTIONS);
  const json = await res.json();
  return json.data as { id: number; name: string; slug: string; count: number; image: string | null }[];
}

export async function getProductAttributes() {
  const res = await fetch(`${API_BASE}/product-attributes`, CACHE_OPTIONS);
  const json = await res.json();
  return json.data as Record<string, {
    id: number; name: string; slug: string;
    terms: { id: number; name: string; slug: string; count: number }[];
  }>;
}
```

---

## 14. Review System

The review system now exposes public read endpoints plus protected create/upload/delete mutations. The old **Vote on a Review** flow has been removed entirely. Internally, the feature is organized into `Controller/`, `Repository/`, `Service/`, and `Support/` folders, plus a transient-backed `RateLimiter` and a WooCommerce admin moderation screen.

| Operation | Namespace | Auth Required |
|---|---|---|
| Read product reviews, random reviews, rating aggregates | `wpadhlwrapi/v1` | ❌ None |
| Create reviews, upload review media, delete reviews | `api` | ✅ Bearer JWT |

**Review layer modules**
- `Controller/` — `ReviewController`
- `Repository/` — `ReviewRepository`, `ReviewAggregateRepository`, `ReviewMediaRepository`
- `Service/` — `ReviewService`, `ReviewAggregateService`, `ReviewMediaService`
- `Support/` — `ReviewNormalizer`, `ReviewValidator`
- `Service/RateLimiter.php` — transient-based submission throttling (`3` submissions per 24 hours)
- `Admin/` — `AdminReviewController` for WooCommerce moderation

> **Note:** `Error Reference` and `Complete Typical Flows` anchors have shifted to sections 15 and 16.

**Namespace / file reference**

| Class | Namespace | Purpose |
|---|---|---|
| `ReviewController` | `Reviews\Controller` | HTTP adapter for public and protected review endpoints |
| `ReviewRepository` | `Reviews\Repository` | CRUD for the `custom_product_reviews` table |
| `ReviewAggregateRepository` | `Reviews\Repository` | CRUD for the `custom_review_aggregates` table |
| `ReviewMediaRepository` | `Reviews\Repository` | CRUD for the `custom_review_media` table |
| `ReviewService` | `Reviews\Service` | Business logic for create, list, delete, and moderate |
| `ReviewAggregateService` | `Reviews\Service` | Rating aggregate calculation and WooCommerce meta sync |
| `ReviewMediaService` | `Reviews\Service` | File upload validation, storage, and media linking |
| `RateLimiter` | `Reviews\Service` | Transient-based rate limiting (`3` submissions per 24h) |
| `ReviewNormalizer` | `Reviews\Support` | Transforms raw DB rows into frontend-safe arrays |
| `ReviewValidator` | `Reviews\Support` | Input validation for review creation |
| `ReviewServiceProvider` | `Reviews` | Registers review services/controllers in the plugin container |
| `AdminReviewController` | `Reviews\Admin` | WordPress admin UI for approve/reject/delete actions |

---

### 14.1 GET Product Reviews (Public)

Retrieve a paginated list of **approved** reviews for a specific product.

```
GET /wp-json/wpadhlwrapi/v1/reviews/product/{product_id}
```

**Auth:** None

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (1-based) |
| `per_page` | integer | `10` | Reviews per page (max `50`) |
| `orderby` | string | `created_at` | Sort field: `created_at` (date) or `helpful_count` |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 42,
      "author": {
        "name": "John Doe",
        "is_verified": true,
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "rating": 5,
      "title": "Great product",
      "content": "Detailed review content...",
      "status": "approved",
      "media": [
        {
          "id": 1,
          "url": "https://example.com/wp-content/uploads/reviews/2024/01/image.jpg",
          "type": "image",
          "mime_type": "image/jpeg",
          "size": 12345
        }
      ],
      "date": "2024-01-15T10:30:00+00:00"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "per_page": 10,
    "total_pages": 3
  }
}
```

> **Implementation note:** This endpoint uses `Response::list()`, so `meta` is a top-level key and the review rows are returned directly in `data`.

**Next.js Example:**

```tsx
async function getProductReviews(productId: number, page = 1) {
  const res = await fetch(
    `${process.env.WP_URL}/wp-json/wpadhlwrapi/v1/reviews/product/${productId}?page=${page}&per_page=10&orderby=created_at`
  );
  if (!res.ok) throw new Error('Failed to fetch reviews');
  const payload = await res.json();
  return { reviews: payload.data, meta: payload.meta };
}
```

---

### 14.2 GET Random Reviews (Public)

Return a random selection of approved reviews across all products. Suitable for testimonial blocks or homepage carousels.

```
GET /wp-json/wpadhlwrapi/v1/reviews/random
```

**Auth:** None

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | `5` | Number of reviews to return (max `10`) |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 17,
      "product_id": 88,
      "author": {
        "name": "Jane Doe",
        "is_verified": true,
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "rating": 5,
      "title": "Life changing!",
      "content": "Could not be happier with this purchase.",
      "status": "approved",
      "media": [],
      "date": "2024-10-03T08:14:22+00:00"
    }
  ]
}
```

**Next.js Example:**

```tsx
// Server Component — no token needed
async function HomepageReviews() {
  const res = await fetch(
    `${process.env.WP_URL}/wp-json/wpadhlwrapi/v1/reviews/random?limit=5`,
    { next: { revalidate: 600 } }
  );
  const { data: reviews } = await res.json();
  return <TestimonialCarousel reviews={reviews} />;
}
```

---

### 14.3 GET Rating Aggregate (Public)

Return the aggregate rating data for a product: total review count, average rating, and the per-star distribution.

```
GET /wp-json/wpadhlwrapi/v1/reviews/aggregate/{product_id}
```

**Auth:** None

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "product_id": 42,
    "total_reviews": 25,
    "average_rating": 4.5,
    "distribution": {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 8,
      "5": 11
    }
  }
}
```

**Next.js Example:**

```tsx
async function getRatingAggregate(productId: number) {
  const res = await fetch(
    `${process.env.WP_URL}/wp-json/wpadhlwrapi/v1/reviews/aggregate/${productId}`,
    { next: { revalidate: 600 } }
  );
  return (await res.json()).data;
}
```

---

### 14.4 POST Create Review (Protected)

Create a new review for the authenticated user.

```
POST /wp-json/api/reviews/create
```

**Auth:** Bearer JWT (required)

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "product_id": 42,
  "rating": 5,
  "title": "Great product",
  "content": "Detailed review content..."
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `product_id` | integer | ✅ | Must be a published WooCommerce product |
| `rating` | integer | ✅ | Must be between `1` and `5` |
| `title` | string | ❌ | Optional review headline |
| `content` | string | ✅ | Must be non-empty after stripping tags |

**Validation / business rules:**
- Authenticated users only (`get_current_user_id() > 0`)
- Product must exist, be published, and be of type `product`
- Rate limited to `3` submissions per `24` hours per user
- Duplicate/spam check uses a transient keyed from the normalized content hash plus `product_id`
- A user can only review the same product once
- Verified purchase is derived from WooCommerce orders with status `completed` or `processing`
- Review status is `approved` when `hl_review_auto_approve` is enabled; otherwise `pending`

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": 55,
    "product_id": 42,
    "author": {
      "name": "John Doe",
      "is_verified": true,
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "rating": 5,
    "title": "Great product",
    "content": "Detailed review content...",
    "status": "pending",
    "media": [],
    "date": "2024-01-15T10:30:00+00:00"
  }
}
```

**Error Responses:**

| Code | HTTP | Description |
|---|---|---|
| `unauthenticated` | `401` | Missing or invalid authenticated user context |
| `invalid_product` | `404` | Product does not exist or is not published |
| `invalid_rating` | `400` | Rating outside the `1`–`5` range |
| `empty_content` | `400` | Content is empty or whitespace-only |
| `rate_limited` | `429` | More than `3` reviews submitted within `24` hours |
| `duplicate_review` | `409` | Identical content for the same product was submitted recently |
| `already_reviewed` | `409` | The user has already reviewed this product |
| `insert_failed` | `500` | Database insert failed |

**Next.js Example:**

```tsx
async function submitReview(token: string, data: ReviewInput) {
  const res = await fetch(`${process.env.WP_URL}/wp-json/api/reviews/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const { code, message } = await res.json();
    throw new Error(`[${code}] ${message}`);
  }
  return (await res.json()).data;
}
```

---

### 14.5 POST Upload Review Media (Protected)

Upload a single media file and attach it to an existing review.

```
POST /wp-json/api/reviews/media/upload
```

**Auth:** Bearer JWT (required)

**Content-Type:** `multipart/form-data`

**Request Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | binary | ✅ | Image or MP4 file to upload |
| `review_id` | integer | ✅ | Review ID the media should be linked to |

**Constraints:**
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`
- Max file size: `5 MB`
- Max `5` media items per review
- Blocked extensions include executable/script types such as `.php`, `.js`, `.html`, `.exe`, `.sh`, `.py`
- Files are stored in the WordPress uploads directory under a `reviews/` subdirectory

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://example.com/wp-content/uploads/reviews/2024/01/image.jpg",
    "type": "image",
    "mime_type": "image/jpeg",
    "size": 204800
  }
}
```

**Next.js Example:**

```tsx
async function uploadReviewMedia(token: string, reviewId: number, file: File) {
  const formData = new FormData();
  formData.append('review_id', String(reviewId));
  formData.append('file', file);

  const res = await fetch(`${process.env.WP_URL}/wp-json/api/reviews/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to upload review media');
  return (await res.json()).data;
}
```

---

### 14.6 DELETE Delete Review (Protected)

Permanently delete a review. The acting user must own the review or have the `manage_woocommerce` capability.

```
DELETE /wp-json/api/reviews/{review_id}
```

**Auth:** Bearer JWT (required)

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "review_id": 42
  }
}
```

**Error Responses:**

| Code | HTTP | Description |
|---|---|---|
| `review_not_found` | `404` | Review does not exist |
| `forbidden` | `403` | Acting user is neither the review owner nor an admin |
| `delete_failed` | `500` | Database delete failure |

---

### 14.7 Review System Notes

- **Caching:** Product review lists are cached for `5` minutes in cache group `hl_reviews` using keys shaped like `product_{id}_p{page}_pp{per_page}_ob{orderby}`. Aggregates are cached for `10` minutes under `hl_aggregate_{product_id}`. Random review lists are cached for `10` minutes under `hl_reviews_random_{limit}`.
- **Cache invalidation:** Product/list/aggregate caches are recalculated or flushed when an approved review is created, when an approved review is deleted, or when moderation changes a review's approval state.
- **Rate limiting:** Review creation is limited to `3` submissions per `24` hours per authenticated user via transients like `hl_review_rate_{md5("user_{id}")}`.
- **Spam check:** Duplicate content protection stores a transient shaped like `hl_review_spam_{md5(strtolower(trim(content)))}_{product_id}` for `24` hours.
- **Auto-approve:** Controlled by the `hl_review_auto_approve` WordPress option.
- **Media storage:** Review uploads are written to the standard WordPress uploads directory under `reviews/`.
- **Admin moderation:** `AdminReviewController` registers a WooCommerce → Reviews submenu and supports approve, reject, and delete actions for users with the `manage_woocommerce` capability.
- **Normalization:** `ReviewNormalizer` removes sensitive/internal fields such as guest email, IP address, and user agent from API responses.
- **WooCommerce sync:** `ReviewAggregateService` syncs `_wc_average_rating`, `_wc_review_count`, and `_wc_rating_count` after aggregate recalculation.

---

## 15. Error Reference

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

## 16. Complete Typical Flows

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

## 17. Environment Configuration

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

Update the relevant section, add the endpoint to the [Complete Typical Flows](#14-complete-typical-flows) if it belongs to a user journey, and update the [Error Reference](#13-error-reference) for any new error codes.
