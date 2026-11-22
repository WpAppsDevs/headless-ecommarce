# Authentication flow

## Actors and tokens

| Token | Where it lives | Lifetime | Used for |
| --- | --- | --- | --- |
| Access token | `tokenCache` in memory; httpOnly `access_token` cookie | 1 hour | `Authorization: Bearer` on API calls |
| Refresh token | httpOnly `refresh_token` cookie | 14 days | `POST /api/auth/refresh` |
| Session hint | readable `session_hint=1` cookie | 14 days | Tells the client a refresh token may exist; carries no credential |
| Guest cart token | `localStorage['cart_token']` | Issued per guest session | Cart calls before login |

The access token is readable by JavaScript because it is returned in the login response. The refresh token is never returned to JavaScript.

## Guest visit

1. No auth call runs unless the visitor has a guest cart token, a cached access token, or a `session_hint` cookie.
2. The first cart add may return `guest_token`. `cartStore.addItem()` writes it to `localStorage['cart_token']` only if no token is already stored.
3. Later cart calls pass that token explicitly; `apiClient` falls back to `tokenCache` only when no explicit token is given.
4. `CartHydrator` refuses to fetch for a visitor with no session and no guest token. That avoids a guaranteed 401 and the redirect loop that used to follow it.

## Login

```
LoginForm
  → authStore.login(username, password, guestToken)
  → POST /api/auth/login
  → WordPress POST /wp-json/api/auth/login
  → WordPress merges the guest cart when guest_cart_token is present
  → route sets access_token, refresh_token, and session_hint cookies
  → route returns { user, access_token }
  → tokenCache.set(access_token)
  → clearGuestToken()
  → authStore sets user (with roles)
  → cartStore.fetchCart()
  → wishlistStore.syncGuestWishlist()
```

The login route returns the access token in JSON, but not the refresh token. The refresh cookie is set on the same response.

### Where a sign-in lands

`src/lib/login-redirect.ts` owns the decision, so the login form, the tests and
a future second entry point cannot disagree:

| Roles | No `redirect` | `redirect=/checkout` | `redirect=/studio` | `redirect=/account` |
| --- | --- | --- | --- | --- |
| `customer` | `/account` | `/checkout` | `/account` (dropped) | `/account` |
| `ns_staff` / `administrator` | `/studio` | `/checkout` | `/studio` | `/studio` (dropped) |

A `redirect` wins only when it is a single-slash internal path (`isSafeRedirect`
rejects `//host`, `http(s)://…`, `javascript:` and backslash tricks) **and**
`canOpenPath` says the role may open it. Studio is staff-only; the account is
customer-only, because the account page bounces staff to `/studio`.

A `reset=success` query string still shows the "password updated" banner.

### Roles

`GET /api/auth/login`, `/api/auth/refresh` and `GET /api/user` return
`roles: string[]` — the WordPress role slugs (for example
`['customer', 'ns_staff']`). The profile keeps them, and `authStore` mirrors
them on the signed-in user so the header and the landing decision need no extra
call. Roles are read from the database on every request and are deliberately
absent from the JWT: a role removed in wp-admin takes effect on the next
request, not when the token expires. A user may hold several roles; the
storefront matches membership in the array.

## Registration

`RegisterForm` collects first name, last name, email, password, and confirmation. `authStore.register()` posts to `/api/auth/register`, receives the same cookie pair and user payload, and runs the same post-login steps.

Registration requires a password of at least eight characters in the form. The server may impose its own rules; surface its message rather than guessing.

## Reload and hydration

`AuthHydrator` calls `authStore.hydrate()` once on mount.

```
hydrate()
  if no guest cart, no cached access token, and no session_hint → hydrated = true, stop
  POST /api/auth/refresh
  if not ok → stop (stay logged out)
  tokenCache.set(new token)
  profile = normalizeUserProfile(data.profile)   # refresh already returns it
  if profile → set user (with roles), profile, isAuthenticated
  finally → hydrated = true
```

`session_hint` exists because the refresh cookie is httpOnly and JavaScript cannot read it. The hint is set on login, registration, and every successful refresh, and cleared on logout and refresh failure. A signed-in user with no guest cart token therefore still rehydrates after a reload, while a fresh visitor makes no auth request.

`CartHydrator` and `WishlistHydrator` wait for `hydrated` before they run. That ordering is why auth must finish first even when it does nothing.

## Access token expiry

`apiClient` handles a 401 in the browser:

1. If no refresh is in flight, start one. The promise is shared.
2. `POST /api/auth/refresh` reads the refresh cookie.
3. The route accepts either `access_token` or `token` in the WordPress response, stores the new access token cookie, and rotates the refresh cookie when WordPress returns one.
4. Retry the original request once with the new token.
5. If the retry is still 401, call the unauthorized handler.

The unauthorized handler in `authStore`:

- records whether a real access token existed,
- clears `tokenCache` and user state,
- clears the cart and wishlist,
- for a guest token failure, removes the dead guest token and does not redirect,
- for a real session, redirects to `/login` unless already there.

Server-side `apiClient` does not refresh. A server page that receives a 401 must handle it or degrade.

## Refresh failure

If the refresh token is missing, expired, or rejected:

- `/api/auth/refresh` returns a non-2xx response,
- the route expires the access, refresh, and session hint cookies,
- `authStore.hydrate()` leaves the user logged out,
- `apiClient` calls the unauthorized handler.

Expiring the cookies is important. Without it, every page load retries a doomed refresh.

## Logout

`authStore.logout()`:

1. Clears the token cache.
2. Calls `/api/auth/logout`, which expires the access, refresh, and session hint cookies.
3. Clears user and auth flags.
4. Clears the cart.
5. Clears the review-session store.
6. Clears the wishlist store, so the header badge cannot show the previous user's list.

## Forgot and reset password

Both are thin proxies:

- `POST /api/auth/forgot-password` → WordPress `api/auth/forgot-password`.
- `POST /api/auth/reset-password` → WordPress `api/auth/reset-password`.

`ForgotPasswordForm` asks for an email. `ResetPasswordForm` reads `key` and `login` from the query string, checks the password confirmation locally, and posts the new password. On success it navigates to `/login?reset=success`.

The WordPress plugin builds the reset link. Its configured reset URL must point at this storefront, not the WordPress admin. That is a WordPress-side setting, not a frontend one.

## Protected pages

`/account` and `/checkout` are client pages.

- `/account` waits for `hydrated`. If `isAuthenticated` is false, it redirects to `/login`. It then fetches profile and orders. Auth errors call `logout()` and redirect.
- `/checkout` calls `getUser()` immediately. `session_expired` and `invalid_token` redirect to `/login?redirect=/checkout`. Other profile errors let the form render without prefill.

`src/proxy.ts` (Next.js 16's middleware replacement) also guards both paths. It checks for `refresh_token` or `session_hint` and redirects to `/login?redirect=<path>` when both are absent. The check is presence-only; it is not an authorization boundary. WordPress still authorizes every data request, and the client redirect remains the fallback for expired sessions.

## The staff dashboard

There is one login for everybody. `/studio/login` no longer renders a form: it
redirects to `/login?redirect=/studio`, and the role in the profile decides
where the person lands.

`/studio` is a separate surface with the same identity. A staff member is a
WordPress user with the `ns_staff` role ("NS Shop Staff"); administrators reach
it too, so the owner can never lock themselves out of the surface they
provision staff for. A shop manager holding `edit_products` is **not** staff.

Three layers decide access, in order:

1. `src/proxy.ts` redirects `/studio/*` to `/login?redirect=<path>` when neither
   session cookie is present. Presence only, exactly like `/account`.
2. `StaffGate` waits for `hydrated`, then reads `roles` from the profile. A
   signed-out visitor goes to `/login?redirect=<path>`; a signed-in customer
   sees the no-access screen without any request.
3. A staff profile then calls `GET /api/staff/access` once per mount. The plugin
   checks the role (`ns_staff` or `administrator`) and answers `403 forbidden`
   otherwise, which catches a role revoked while the session is still valid.

Outcomes stay distinct: `401`/`no_token`/`invalid_token` means the session
ended → back to `/login`; `403` means no access → the no-access screen with
sign-out; anything else (`404 rest_no_route` on an older plugin, a 5xx, a
network failure) is "the product service is not available", and the session is
kept.

Staff do not use `/account`: the account page sends a signed-in staff member to
`/studio` before loading orders.

## Where to change auth

| Change | File |
| --- | --- |
| Cookie names, lifetimes, flags | `src/app/api/auth/login/route.ts`, `register/route.ts`, `refresh/route.ts`, `logout/route.ts` |
| Client login, logout, hydration | `src/stores/authStore.ts` |
| 401 retry and token cache | `src/lib/api/client.ts` |
| Login/register UI | `src/components/auth/` |
| Protected page redirects | `src/app/(storefront)/account/page.tsx`, `src/app/(storefront)/checkout/page.tsx` |
| Staff dashboard guard | `src/components/staff/StaffGate.tsx`, `src/app/api/staff/access/route.ts` |

## Test cases to keep green

- Guest adds to cart, logs in, cart survives.
- Guest wishlist merges on login without duplicating server items.
- Reload keeps a signed-in user signed in, including users with no guest cart token.
- Expired access token refreshes once and retries.
- Expired refresh token logs out without a redirect loop.
- Stale guest cart token clears itself instead of forcing `/login`.
- Logout clears the cart, wishlist, and review state.
