# State management

Client state lives in five Zustand stores under `src/stores/`. There is no Redux, no React Query, and no commerce context provider.

## Why Zustand

The stores are small, read by unrelated parts of the tree (header badge, product card, checkout page), and need to survive route changes. Zustand gives that without wrapping the app in providers, and each store can be imported directly.

The trade-off is visible in the code: stores import each other, hydration is manual, and there is no built-in request cache or invalidation. Those are deliberate constraints, not missing abstractions.

## Store map

| Store | State | Server sync | Persistence |
| --- | --- | --- | --- |
| `authStore` | user, flags, actions | `/api/auth/*` | Access token in memory, refresh in cookie |
| `cartStore` | items, tokens, shipping, drawer | WordPress cart endpoints | Guest token in localStorage |
| `wishlistStore` | IDs, count, pending IDs | `/api/wishlist/*` | Guest IDs in localStorage |
| `reviewStore` | reviewed product IDs | none | memory |
| `currencyStore` | formatting settings | `/api/store-settings` | memory |

## `authStore`

State: `user`, `isAuthenticated`, `loading`, `hydrated`.
Actions: `login`, `register`, `logout`, `refreshToken`, `hydrate`.

The end-to-end sequence for login, hydration, refresh failure, and logout lives in [flows/authentication.md](flows/authentication.md). This section records what the store itself owns.

- `login` and `register` run the auth flow, then start `cartStore.fetchCart()` and `wishlistStore.syncGuestWishlist()` without awaiting them.
- `logout` clears the token cache, user state, cart, wishlist, and review-session state. The `/api/auth/logout` route expires the cookies.
- `hydrate` runs once on mount and always ends with `hydrated: true`. It refreshes only when a guest cart token, cached access token, or `session_hint` cookie exists. The predicate is `shouldAttemptAuthHydration()` in `src/lib/auth-session.ts`.
- The unauthorized callback is registered inside the store factory. It is the only place that decides whether a 401 becomes a redirect.

## `cartStore`

State: `items`, `cartToken`, `guestToken`, `shippingMethods`, `chosenShippingMethod`, `loading`, `error`, `cartDrawerOpen`, `lastFetchedAt`.

`fetchCart()` loads the cart and also refreshes shipping methods. It returns early while another fetch is in flight, so the layout hydrator and cart page do not duplicate the request. A successful fetch records `lastFetchedAt`.

`addItem` is optimistic: it appends a `temp-<timestamp>` item, calls the API, replaces the list with the server response, and removes the placeholder on failure. On the first guest add it saves `data.guest_token` to `localStorage['cart_token']` without overwriting an existing token. The full sequence is in [flows/cart-and-checkout.md](flows/cart-and-checkout.md).

`updateItem` and `removeItem` are not optimistic. They set `loading`, call the API, and replace the list.

`clearGuestToken()` removes the localStorage key and nulls state. `clearCart()` resets items and shipping but leaves `guestToken`; callers use `clearGuestToken()` when they mean both.

`toErrorMsg()` maps `out_of_stock` to "This item is out of stock" and otherwise uses the API message.

The store does not throw on a failed add. Components check `useCartStore.getState().error` after awaiting `addItem()`. That is why `VariationSelector` reads the store after the call instead of catching an exception.

## `wishlistStore`

State: `ids`, `count`, `pendingIds`, `hydrated`.
Actions: `toggle`, `remove`, `isWishlisted`, `isPending`, `hydrate`, `syncGuestWishlist`.

Authentication is inferred from `tokenCache.get()`, not from `authStore`. A guest writes IDs to `localStorage['wishlist_ids']`; a signed-in user calls the wishlist API.

`toggle`:

1. Returns early if the product is already pending.
2. Flips the local ID set and count.
3. For a guest, saves localStorage and toasts.
4. For a user, calls the toggle API and reconciles the result, because the server decides the final state.
5. Rolls back and toasts on failure.
6. Removes the pending ID in `finally`.

`hydrate(isAuthenticated)` runs once. Authenticated users fetch up to 100 products; guests read localStorage.

`syncGuestWishlist()` runs after login or registration:

1. Reads guest IDs.
2. Fetches server IDs.
3. Toggles only the missing ones.
4. Clears guest storage.
5. Re-fetches the canonical server list.

`count` can exceed `ids.length` when the server has more items than the fetched page. The badge uses `count`.

## `reviewStore`

State: `reviewedProductIds`.
Actions: `markAsReviewed`, `isReviewed`, `clear`.

This store tracks submissions made in the current session. It is not a cache of server data and it does not survive a reload. Order cards use it to hide the "Write Review" action after a submission.

## `currencyStore`

State: `code`, `symbol`, `position`, `decimals`, `decimalSep`, `thousandsSep`, `hydrated`.

`hydrate()` fetches `/api/store-settings` once and maps `data.currency` into the store. It silently keeps USD defaults if the call fails.

`useFormatPrice()` in `src/lib/utils/currency.ts` subscribes to the store and returns a bound formatter. The formatter supports four symbol positions: `left`, `right`, `left_space`, `right_space`.

Use the custom formatter for prices. Store settings define separators and decimals, and the formatter is the only implementation that honors them.

## Hydration order

`src/app/layout.tsx` mounts the hydrators before the header. The dependency that matters is explicit:

- `CartHydrator` and `WishlistHydrator` wait for `authStore.hydrated`.
- `CurrencyHydrator` is independent.
- `CartHydrator` skips the fetch when the visitor has neither a session nor a guest token, which prevents a guest 401 from becoming a login redirect.
- Cart and wishlist hydrators use a `useRef` guard so React Strict Mode does not double-fetch.

## Optimistic update rules

| Store | Optimistic? | Reconciliation |
| --- | --- | --- |
| Cart add | Yes, placeholder item | Replace the whole list on success; remove the placeholder on failure |
| Cart update/remove | No | Replace on success |
| Wishlist toggle/remove | Yes | Server result replaces local state |
| Wishlist guest | Yes | localStorage is the source of truth |
| Reviews | No | Modal closes; list refetches next time |

When adding an optimistic action, keep a copy of the previous state for rollback and clear pending flags in `finally`.

## Guest-to-user merge

Login merges two guest artifacts. The cart merge is server-side: `login()` passes `guest_cart_token` to the auth route, WordPress merges it, then the client clears its guest token and fetches the result. The wishlist merge is client-side: `syncGuestWishlist()` toggles each missing product and clears guest storage. The wishlist merge is best effort; a failed toggle is ignored. The flow details are in [flows/authentication.md](flows/authentication.md) and [flows/cart-and-checkout.md](flows/cart-and-checkout.md).

## Adding a new store

1. Create `src/stores/<domain>Store.ts` with a state interface and an action interface.
2. Put network calls in `src/lib/api/<domain>.ts`.
3. Keep errors in state or throw `ApiError`; use one style per store.
4. Add a hydrator only if the state must survive a page load.
5. Import the store where needed; Zustand needs no provider.

Done when pure logic has a colocated test and the store hydrates once per page load.

## Related

- [data-layer.md](data-layer.md)
- [flows/authentication.md](flows/authentication.md)
- [flows/cart-and-checkout.md](flows/cart-and-checkout.md)
- [ADR-0002](adr/0002-zustand-and-hydrators.md)
