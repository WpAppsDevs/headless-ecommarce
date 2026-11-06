# ADR-0002: Zustand stores with hydrators

## Status

Accepted.

## Context

Cart, auth, wishlist, currency, and review-session state are read by unrelated parts of the tree: the header badge, product cards, checkout, account pages, and order cards. The app needs shared state without wrapping every route in providers and without adding a server-state library for a small number of endpoints.

## Decision

Use one Zustand store per domain in `src/stores/`.

- `authStore` owns identity and orchestrates login, register, logout, refresh, and hydration.
- `cartStore` owns items, tokens, shipping methods, errors, and drawer visibility.
- `wishlistStore` owns IDs, count, pending IDs, and guest synchronization.
- `reviewStore` owns the set of products reviewed in the current session.
- `currencyStore` owns display formatting derived from store settings.

Hydration is explicit. Four client components in the root layout call one hydration action each. They render nothing and guard against Strict Mode double invocation with a ref.

## Alternatives considered

- **React Context.** Rejected. It would add a provider tree and re-render scope for state that is read in many branches.
- **Redux Toolkit.** Rejected as too much ceremony for five small stores.
- **TanStack Query.** Not adopted. It would help with request caching and invalidation, but the app currently treats server data as page props or store state and has no shared query cache.
- **Persisting the whole store to localStorage.** Rejected. It would persist tokens and stale server data.

## Consequences

- Stores can import each other. `authStore` calls into cart, wishlist, and review stores on login and logout. The dependency is one-way.
- Hydration order matters. Cart and wishlist wait for auth to finish, even when auth does nothing.
- There is no general request cache. The cart store guards its own in-flight request and records `lastFetchedAt`, so the layout hydrator and cart page do not issue duplicate GETs.
- Guest state uses localStorage (`cart_token`, `wishlist_ids`), so it must be cleared on login and handled when stale.
- Auth rehydration uses three signals before refreshing: a guest cart token, a cached access token, or the readable `session_hint` cookie. Anonymous visitors make no auth request.

## Related

- [state-management.md](../state-management.md)
- [flows/authentication.md](../flows/authentication.md)
