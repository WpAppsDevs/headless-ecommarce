# Remediation archive

This is a closed record of the frontend fixes completed after the first documentation pass. It is not a task list. For what is still open, read [known-gaps.md](known-gaps.md).

## What changed

| Area | Result |
| --- | --- |
| Auth reload | Login, registration, and refresh set a readable `session_hint` cookie; hydration checks it before refreshing. The predicate lives in `src/lib/auth-session.ts`. |
| Route protection | `src/proxy.ts` redirects `/account/*` and `/checkout` to login when no session cookie is present. Presence only, not authorization. |
| Lint | `npm run lint` is clean. |
| Tests | Vitest runs unit tests for order filtering, tracking normalization, currency formatting, shipping fallback, and the session-hint predicate. |
| Cart | Duplicate fetch removed with an in-flight guard and `lastFetchedAt`; one shared shipping fallback. |
| Cart UI | Coupon, free-shipping, expiry, and terms UI removed rather than left behind dead flags. |
| API errors | `apiClient` throws on `{ success: false }`, non-2xx responses, and unparseable bodies. |
| Wishlist | `wishlistStore.clear()` runs on logout and session expiry. |
| Account | Settings and address are read-only. The fake save, fake edit, and Cancel Order button were removed. |
| Order confirmation | The session result survives refresh; a signed-in fallback finds recent orders; an empty state offers a next step. |
| Contact | `/contact` exists and the header fallback no longer 404s. |
| Dead code | Removed unused components, the unused filter route, the unused hook, the empty user module, and empty escaped directories. |
| Errors | `/api/errors` logs reports and optionally forwards to `ERROR_REPORT_WEBHOOK_URL`. |
| Docs | Architecture, auth, cart, account, operations, and known gaps were updated in the same change. |

## Verification

At the archive commit:

- `npm test` — 17 tests across 5 files.
- `npm run lint` — no errors or warnings.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds, including `/contact` and the proxy.

## What did not change

These need WordPress endpoints or a product decision. They are tracked in [known-gaps.md](known-gaps.md):

- guest checkout,
- profile, password, and address updates,
- order cancellation,
- single-order confirmation lookup,
- review ownership for delete,
- an end-to-end test suite.

## Using this file

Do not extend it. New work belongs in the current docs or in an issue under `.scratch/`. If you need the reasoning behind a past change, use git history and the flow docs.
