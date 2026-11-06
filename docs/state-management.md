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

`login(username, password, guestToken?)`:

1. Posts to `/api/auth/login` with `guest_cart_token` when the caller has one.
2. Stores `data.access_token` in `tokenCache`.
3. Removes the guest cart token.
4. Sets the user.
5. Starts `cartStore.fetchCart()` and `wishlistStore.syncGuestWishlist()` without awaiting them.

`register` follows the same shape and also merges the guest cart and wishlist.

`logout`:

1. Clears `tokenCache`.
2. Calls `/api/auth/logout` to expire cookies (fire and forget, errors ignored).
3. Clears user and auth flags.
4. Clears the cart and review-session state.
5. Does **not** clear the wishlist store. The header badge can keep the previous user's count until reload.

`hydrate()`:

1. Returns immediately if there is neither a guest cart token nor a cached access token.
2. Calls `/api/auth/refresh`.
3. Stores the new token and fetches `/api/auth/me`.
4. Sets the user.
5. Always sets `hydrated: true` in `finally`.

The early return is a real limitation. A signed-in user with no guest cart token and no cached token after a full reload is treated as a fresh visitor, so the refresh flow never runs. See [known-gaps.md](known-gaps.md).

The unauthorized callback is registered inside the store factory. It is the only place that decides whether a 401 becomes a redirect.

## `cartStore`

State: `items`, `cartToken`, `guestToken`, `shippingMethods`, `chosenShippingMethod`, `loading`, `error`, `cartDrawerOpen`.

`fetchCart()` loads the cart and also refreshes shipping methods.

`addItem(productId, variationId, quantity, attributes?)`:

1. Creates a temporary item with `id: temp-<timestamp>` and appends it immediately.
2. Calls the API.
3. On the first guest add, saves `data.guest_token` to `localStorage['cart_token']`. It never overwrites an existing token.
4. Replaces the item list with the server response.
5. On failure, removes the temporary item and stores a message.

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

Do not use `toLocaleString` for prices. The store settings define separators and decimals, and the custom formatter is the only implementation that honors them.

## Hydration order

`src/app/layout.tsx` mounts four hydrators before the header:

```tsx
<AuthHydrator />
<CartHydrator />
<WishlistHydrator />
<CurrencyHydrator />
```

They all render `null`. Mount order is render order; effect order follows it, but the real dependency is explicit:

- `CartHydrator` waits for `authStore.hydrated`.
- `WishlistHydrator` waits for `authStore.hydrated`.
- `CurrencyHydrator` is independent.

`CartHydrator` also skips the fetch when the visitor has neither a session nor a guest token. That skip prevents a guest 401 from triggering a login redirect.

`CartHydrator` and `WishlistHydrator` use a `useRef` guard so React Strict Mode does not double-fetch. Keep that guard when editing them.

## Optimistic update rules

| Store | Optimistic? | Reconciliation |
| --- | --- | --- |
| Cart add | Yes, placeholder item | Replace the whole list on success; remove the placeholder on failure |
| Cart update/remove | No | Replace on success |
| Wishlist toggle/remove | Yes | Server result replaces local state |
| Wishlist guest | Yes | localStorage is the source of truth |
| Reviews | No | Modal closes; list refetches next time |

When adding an optimistic action, always keep a copy of the previous state for rollback. Do not leave a pending flag set on an exception; use `finally`.

## Guest-to-user merge

Two guest artifacts are merged on login or registration:

- **Cart** — `login()` passes `guest_cart_token` to the auth route; WordPress merges the guest cart server-side; the client then clears its guest token and fetches the merged cart.
- **Wishlist** — `syncGuestWishlist()` runs in the browser after login and toggles each missing product.

The cart merge is server-side. The wishlist merge is client-side and best effort; a failed toggle is ignored.

## Adding a new store

1. Create `src/stores/<domain>Store.ts` with a state interface and an action interface.
2. Put network calls in `src/lib/api/<domain>.ts`.
3. Keep errors in state or throw `ApiError`; do not mix styles within one store.
4. Add a hydrator only if the state must survive a page load.
5. Import the store where needed; do not create a provider.

## Related

- [data-layer.md](data-layer.md)
- [flows/authentication.md](flows/authentication.md)
- [flows/cart-and-checkout.md](flows/cart-and-checkout.md)
- [ADR-0002](adr/0002-zustand-and-hydrators.md)
