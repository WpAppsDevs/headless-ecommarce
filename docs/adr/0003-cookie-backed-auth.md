# ADR-0003: Cookie-backed authentication

## Status

Accepted, with a known rehydration limitation.

## Context

The WordPress wrapper returns an access token and a refresh token. Keeping both in localStorage would expose long-lived credentials to any script on the page. Server Components cannot read an in-memory token, and the browser must send a bearer token to authenticated endpoints.

## Decision

Split the tokens by lifetime and exposure.

- **Access token** — 1 hour. Returned in the login/register/refresh JSON and stored in module memory (`tokenCache`). Also set as an httpOnly `access_token` cookie for completeness.
- **Refresh token** — 14 days. httpOnly `refresh_token` cookie only. Never returned to client JavaScript.
- **Hydration** — on page load, the client calls `POST /api/auth/refresh`, which reads the refresh cookie and returns a new access token.
- **401 handling** — `apiClient` refreshes once, retries, and then calls the unauthorized handler.
- **Cookies** — `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`.

The Next.js auth route handlers are the only place that touches the refresh token. They also reshape the WordPress response so the client sees a stable `{ user, access_token }` shape.

## Alternatives considered

- **Both tokens in localStorage.** Rejected for XSS exposure.
- **Both tokens in httpOnly cookies and a server session.** Rejected because authenticated pages are client-rendered and send bearer tokens to WordPress; reading cookies in every request would require a larger refactor.
- **No refresh token, re-login on expiry.** Rejected as a poor experience.
- **NextAuth or a third-party identity provider.** Rejected. WordPress owns users and passwords.

## Consequences

- A page reload loses the in-memory access token and must refresh.
- Hydration checks for a guest cart token, a cached access token, or the `session_hint` cookie before calling refresh. The hint is readable and carries no credential; the refresh token stays httpOnly.
- A 401 from a guest cart token must not redirect to login. The unauthorized handler distinguishes the two cases to avoid a redirect loop.
- Production must use HTTPS, or `secure` cookies are rejected.
- Changing domains invalidates sessions.

## Related

- [flows/authentication.md](../flows/authentication.md)
- [data-layer.md](../data-layer.md)
- [ADR-0004](0004-proxy-route-handlers.md)
