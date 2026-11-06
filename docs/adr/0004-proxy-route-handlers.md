# ADR-0004: Next.js route handlers as proxies

## Status

Accepted.

## Context

WordPress and the storefront run on different origins. Public catalog reads work directly from the server and, for some endpoints, from the browser. Authenticated POSTs and multipart uploads fail CORS preflight or expose tokens when called directly from the browser.

## Decision

Add explicit Next.js route handlers under `src/app/api/` for endpoints that need one of:

- CORS avoidance for browser calls,
- httpOnly cookie handling,
- response normalization (orders),
- multipart forwarding,
- a secret that must not reach the client (Mailchimp).

The handlers forward the caller's `Authorization` header and body. Authorization stays with WordPress.

Some public calls stay direct:

- server-rendered catalog reads,
- cart operations from the browser,
- country lists,
- filters from the server page.

## Alternatives considered

- **One catch-all proxy `/api/[...path]`.** Rejected. It would be easier to write and much harder to audit for which endpoints carry tokens, which cache, and which reshape data.
- **Configure WordPress CORS for everything.** Rejected. It would expose authenticated endpoints to any origin and still leave cookie handling unsolved.
- **Server Actions for every mutation.** Not adopted. Checkout, Stripe, and multipart uploads fit the route-handler model better, and the existing API modules are shared by server and client code.

## Consequences

- Every new authenticated browser call needs a matching route handler and an API function.
- The proxy table in [data-layer.md](../data-layer.md) is the map. Keep it current.
- A handler that filters data must also repair pagination. `/api/account/orders` is the example.
- Handlers mostly collapse failures into a 500 `server_error`. That is consistent but loses upstream detail.
- There is duplication between the client and server URL branches in `src/lib/api/`. It is the price of sharing modules across runtimes.

## Related

- [data-layer.md](../data-layer.md)
- [architecture.md](../architecture.md)
- [ADR-0003](0003-cookie-backed-auth.md)
