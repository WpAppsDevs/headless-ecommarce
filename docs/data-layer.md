# Data layer

Everything that talks to WordPress lives in `src/lib/api/` or in a route handler under `src/app/api/`. Components should call those modules, not `fetch` WordPress directly.

## The two base namespaces

`config.apiBase` is `${NEXT_PUBLIC_WP_URL}/wp-json`. Two namespaces sit under it:

| Constant | Value | Used for |
| --- | --- | --- |
| `config.productsNs` | `wpadhlwrapi/v1` | products, cart, reviews, tracking, menus, store settings |
| `config.apiNs` | `api` | auth, user, checkout, orders, wishlist |

The names are historical. `productsNs` is not only products, and `apiNs` is not only account data.

## `apiClient`

`src/lib/api/client.ts` is the shared client for calls that should follow the standard response contract.

```ts
const cart = await apiClient<CartData>(`${config.productsNs}/cart`);
```

What it does:

1. Chooses the token: an explicit `token` option, otherwise `tokenCache` in the browser, otherwise none.
2. Resolves relative paths against `config.apiBase`.
3. Retries once after 500 ms on a network failure (not on an HTTP error).
4. On a browser 401, runs one shared refresh promise, retries with the new token, and calls the unauthorized callback if the retry is still 401.
5. Parses JSON. `{ success: false }` becomes an `ApiError` with the server code and message. A non-2xx response without that shape throws `http_error` with the status. A body-less response also throws. Otherwise returns `json.data` when present, or the whole body.

What it does not do:

- It does not refresh on the server. Server callers pass a token or let the request fail.
- It does not retry idempotently. The 500 ms retry is for network failure only; a failed HTTP request is returned or thrown immediately.

`tokenCache` is module memory. In the browser it survives route changes but not a reload. It is populated by `authStore.login()`, `authStore.register()`, and the refresh flow.

`setOnUnauthorized()` exists to avoid a circular import between the client and the auth store. `authStore` registers the callback at module load. The callback:

- reads whether a real access token existed,
- clears the token cache and auth state,
- clears the cart,
- for a guest token failure, drops the stale `cart_token` and does not redirect,
- for a real session, redirects to `/login` unless already there.

## Browser or server?

Several API modules choose a path at runtime:

```ts
const isClient = typeof window !== 'undefined';
const url = isClient
  ? `/api/reviews/product/${productId}`
  : `${config.apiBase}/${config.productsNs}/reviews/product/${productId}`;
```

This pattern exists because:

- The browser must avoid CORS on authenticated endpoints.
- The server can call WordPress directly, and can use Next.js caching.
- The same function is imported by both server pages and client components.

When adding a function, keep both branches or document why only one runtime is supported.

## Module by module

### `products.ts`

- `getProducts(params)` calls `GET /wpadhlwrapi/v1/products` with `page`, `per_page`, `category`, `brand`, `tag`, `search`. `per_page` is clamped to 100.
- It normalizes missing arrays and image fields, then returns `{ items, meta }`.
- `getProduct(slug)` calls the detail endpoint and normalizes variations. List responses contain variation IDs; detail responses contain full variation objects.
- `getAllProductSlugs()` walks every page at 100 per page. It returns `[]` when `NEXT_PUBLIC_WP_URL` is unset, which keeps a fresh deployment buildable.
- Uses `next: { revalidate: 60 }`.

Raw API images may use `src` or `url`. Always run them through `normalizeImage()`.

### `cart.ts`

- All four operations (`add`, `get`, `update`, `remove`) use `apiClient`.
- The guest JWT is read from `localStorage['cart_token']` and passed as `token`. For a signed-in user there is no guest token, so `apiClient` falls back to the access token.
- `add` accepts an attribute map and serializes it as `{ attributes: {...} }` in `meta`.
- `getShippingMethods(cartData)` returns API shipping methods when present and the hardcoded trio (`free_shipping`, `local_pickup`, `flat_rate`) otherwise.
- Types are string-heavy (`quantity`, `price`, IDs) because that is what the API returns.

### `checkout.ts`

- `getUser()` and `placeOrder()` use `/api/auth/me` and `/api/checkout` in the browser; on the server they use `apiClient`.
- `getCountries()` calls `wpadhlwrapi/v1/countries` directly.
- `placeOrder` sends `gateway`, optional `payment_data`, billing, optional shipping, shipping method, and shipping cost.

### `orders.ts`

- Uses raw `fetch`, not `apiClient`, because it needs the `meta` pagination object.
- Browser URL is `/api/account/orders`; server URL is the WordPress `api/orders`.
- `filterCheckoutDrafts()` removes `checkout-draft` orders and adjusts `total` and `total_pages`.
- Throws `ApiError` when `success` is false.

### `reviews.ts`

- Reads: `getProductReviews`, `getRatingAggregate`, `getRandomReviews`.
- Writes: `submitReview`, `uploadReviewMedia`, `deleteReview`.
- Writes always go through `/api/reviews/*` and use the in-memory token.
- `uploadReviewMedia` uploads one file per request. It must not set `Content-Type`; the browser adds the multipart boundary.
- Aggregate and random endpoints return `null`/`[]` on failure instead of throwing. The product page treats a missing aggregate as "no reviews".

### `tracking.ts`

- `searchTracking({ email, order_id })` posts to `/api/tracking/search`.
- `getTrackingByOrderId(id)` gets `/api/tracking/order/:id` and attaches the bearer token in the browser.
- `normalizeTrackingResult()` flattens three backend shapes into `{ entries }`.
- `normalizeTimeline()` keeps a backend "Order Placed" event, corrects its date to `order.created_at` when present, and creates one if the timeline is empty.
- `no_orders_found` and `not_found` become an empty result; other failures throw.

### `wishlist.ts`

- Every function calls a `/api/wishlist` proxy, because wishlist is authenticated.
- `apiGetWishlist` normalizes product images and arrays the same way `products.ts` does.
- A toggle returns `{ in_wishlist, count }`. The store reconciles optimistic state with that response.

### `filters.ts`

- Fetches categories, tags, brands, and attributes in parallel.
- Uses `safeFetchArray` / `safeFetchObject`: a 404, network error, or parse error becomes an empty collection.
- Caches for 6 hours.
- Extracts `pa_color` and `pa_size` terms from the attributes object.

### `menus.ts`

- Reads `GET /wpadhlwrapi/v1/menus/:location`.
- Keeps top-level items only, sorts by `order`, converts absolute WordPress URLs to relative paths.
- Caches for 5 minutes and returns `[]` on any failure.

## Route handlers

| Route | Upstream | Notes |
| --- | --- | --- |
| `POST /api/auth/login` | `api/auth/login` | Sets `access_token` (1 h), `refresh_token` (14 d), and readable `session_hint` cookies; returns user and access token. |
| `POST /api/auth/register` | `api/auth/register` | Same cookies; returns 201. |
| `POST /api/auth/refresh` | `api/auth/refresh` | Reads the refresh cookie; accepts `access_token` or `token` in the response; rotates the refresh cookie if the plugin returns one; expires cookies on failure. |
| `POST /api/auth/logout` | none | Expires the access, refresh, and session hint cookies. Does not call WordPress. |
| `GET /api/auth/me` | `api/user` | Requires an `Authorization` header. |
| `POST /api/auth/forgot-password` | `api/auth/forgot-password` | Pure proxy. |
| `POST /api/auth/reset-password` | `api/auth/reset-password` | Pure proxy. |
| `POST /api/checkout` | `api/checkout` | Requires a token; forwards the body. |
| `GET /api/account/orders` | `api/orders` | Requires a token; filters drafts; repairs pagination. |
| `GET/POST /api/wishlist` | `api/wishlist` | Requires a token for meaningful results; forwards query. |
| `DELETE /api/wishlist/:id` | `api/wishlist/:id` | Requires a token. |
| `GET /api/wishlist/check/:id` | `api/wishlist/check/:id` | Requires a token. |
| `POST /api/reviews/create` | `api/reviews/create` | Requires a token. |
| `DELETE /api/reviews/:id` | `api/reviews/:id` | Requires a token. |
| `POST /api/reviews/media/upload` | `api/reviews/media/upload` | Requires a token; forwards multipart form data without setting `Content-Type`. |
| `GET /api/reviews/product/:id` | `wpadhlwrapi/v1/reviews/product/:id` | No cache. |
| `GET /api/reviews/aggregate/:id` | `wpadhlwrapi/v1/reviews/aggregate/:id` | 5-minute server cache. |
| `GET /api/reviews/random` | `wpadhlwrapi/v1/reviews/random` | 10-minute server cache. |
| `POST /api/tracking/search` | `api/tracking/search` | Public. Forwards the JSON body without an auth header. |
| `GET /api/tracking/order/:id` | `api/tracking/order/:id` | Requires a token. |
| `GET /api/store-settings` | `wpadhlwrapi/v1/store-settings` | 1-hour server cache and CDN headers. |
| `POST /api/newsletter` | Mailchimp | Secret stays server-side. Returns 503 when unconfigured, 422 on invalid email, and succeeds for an existing member. |
| `POST /api/errors` | optional webhook | Logs client error reports; caps the body at 16 KB; forwards to `ERROR_REPORT_WEBHOOK_URL` when set. |

Most handlers catch every error and return `{ success: false, code: 'server_error', message }` with status 500. They do not distinguish a WordPress timeout from a parse failure.

## Response shape

The wrapper usually returns:

```json
{ "success": true, "data": {}, "meta": {} }
```

Some endpoints return a bare array or wrap the array at the top level. `menus.ts` accepts both. `apiClient` unwraps `data`; raw fetchers do not.

## Invariants

- Never trust array fields. The API may return `{}` where an array is expected. Normalizers guard this for products, wishlist, reviews, and tracking.
- Never trust an image field name. Accept `src` or `url`.
- Never assume a variation is an object. List endpoints return IDs.
- Never expose the refresh token to JavaScript. Only the access token leaves the auth route.
- A guest cart failure must not force a login redirect.
- `checkout-draft` is never shown to a customer.

## Related

- [state-management.md](state-management.md)
- [flows/authentication.md](flows/authentication.md)
- [flows/cart-and-checkout.md](flows/cart-and-checkout.md)
- [ADR-0004](adr/0004-proxy-route-handlers.md)
