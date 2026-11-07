# Coding standards

These rules describe how the codebase is written today and where it is going. Follow them for new code. When a rule and the code disagree, treat the rule as the target and note the deviation in the change.

## TypeScript

- `strict` is on. Keep `tsconfig.json` strict.
- Path alias: `@/*` maps to `src/*`. Use it for cross-folder imports.
- Prefer explicit return types on exported API functions and store actions. Small components can infer.
- Use `unknown` plus a type guard at the boundary, or a narrow interface, instead of `any`.
- API payloads are untrusted. Type the expected shape, then normalize it instead of casting a raw response into a domain type.
- String IDs and numbers are not interchangeable. The cart API returns string IDs and quantities; update and remove calls take numbers. Convert at the call site.

## File and naming conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component file | PascalCase | `ProductCard.tsx` |
| Component export | Named, same name | `export function ProductCard()` |
| Hook | `use` prefix, camelCase file | `useFormatPrice.ts` |
| Store | `<domain>Store.ts` | `cartStore.ts` |
| API module | `<domain>.ts` | `wishlist.ts` |
| Route handler | `route.ts` in the URL folder | `api/auth/login/route.ts` |
| Page | `page.tsx` | `app/cart/page.tsx` |
| Utility | camelCase | `order-utils.ts` |

One exported component per file, PascalCase filename, and import it directly; there are no barrel files. `npm run check:components` enforces the export rule. Local props interfaces stay in the component file unless another file needs them. Domain components live under their domain folder; `src/components/ui/` holds primitives with no commerce meaning.

Split a file when it grows past roughly 300 lines or mixes more than one responsibility. `CheckoutForm.tsx` at 769 lines is the current exception, not the template.

## Server and client boundaries

Start with a Server Component. Add `'use client'` only for:

- state or effects,
- event handlers,
- browser APIs (`localStorage`, `window`, `IntersectionObserver`),
- client-only libraries (Stripe.js),
- Zustand.

Extract the interactive part so the page stays a Server Component.

Server Components can:

- read `searchParams` and `params` (they are promises in Next 16),
- call API modules,
- fetch WordPress directly,
- set `revalidate` and `metadata`.

Server Components in this codebase do not read auth cookies. Authenticated screens are client pages that wait for `authStore.hydrated`.

## Data fetching

- Put remote calls in `src/lib/api/<domain>.ts`; components call those modules.
- Use `apiClient` for the standard `{ success, data }` contract.
- Use raw `fetch` when you need pagination `meta`, a status code, multipart, or a non-standard body. Document why in a comment.
- Choose the right runtime branch: browser → proxy, server → direct. Keep both branches unless the function is server-only.
- Normalize at the boundary. The API may return `{}` for empty arrays or `url` instead of `src`; handle it once in the API module.
- Set a revalidation policy deliberately. If the data should be fresh, use `cache: 'no-store'`; if it is catalog data, use ISR.
- Catch and degrade on server pages. Empty products, empty filters, and missing menus are recoverable; a thrown error is not.
- Pass data down from the page, or lift the fetch, so one page does not fetch the same data twice.

## API and route handlers

- A route handler is a proxy, not a security boundary. Forward the caller's bearer token; let WordPress authorize.
- Forward the request body as-is unless you have a reason to reshape it. For JSON, `await req.json()`; for multipart, `await req.formData()` and let the browser set `Content-Type`.
- Return the upstream status when you forward an error; reserve 200 for success.
- The generic catch returns `{ success: false, code: 'server_error', message: 'Internal server error' }` with 500. Keep that shape.
- Keep tokens out of logs and responses.
- Auth cookies are `httpOnly`, `sameSite: 'lax'`, `path: '/'`, and `secure` in production. Keep those flags.
- The refresh token stays server-side. Only the access token is returned by login/register/refresh.
- When a proxy changes data (orders filtering drafts), adjust pagination too. Hiding rows without adjusting `total` produces empty last pages.
- Use one proxy per resource. Explicit handlers are easier to audit than a catch-all `/api/[...path]` route.

## Errors

Use `ApiError` for API failures:

```ts
throw new ApiError('out_of_stock', 'This item is out of stock');
```

- Preserve the backend `code` when it is meaningful. Map known codes to user-facing copy at the form, not in the API layer.
- Distinguish not found, auth failure, validation failure, and network failure, with a separate message for each.
- Stores keep a human message in `error` and throw only when the caller needs to react. Cart add is the example: it stores the error and the component reads it after awaiting.
- Forms use `setError('root', …)` for form-level errors and inline messages for fields.
- A failed optional section should render nothing, not a broken box. `RelatedProducts`, filters, menus, and rating aggregates follow this rule.

## State

- Put server data in the API layer and UI state in Zustand.
- Use one store per domain; a single component keeps its state locally.
- Optimistic updates need rollback and a `finally` cleanup for pending flags.
- Keep hydration idempotent. Keep the hydrator ref guard.
- Keep the dependency direction auth → others: cart and wishlist import API modules and their own store state, not `authStore`.
- Keep the access token in memory and the refresh token in an httpOnly cookie.

## Forms

- Use `react-hook-form` with `zodResolver`.
- Define the schema next to the form. Export it only if another file needs it.
- Validate on submit. For a single field, use native validation.
- Keep API error messages separate from field validation messages.
- Disable the submit button while submitting and restore it in `finally`.
- For checkout, keep the zod schema and the payload builder in sync. A field that validates but is not sent is a bug.

## Styling

- Use brand tokens and Tailwind utilities.
- Use `cn()` for conditional classes.
- Keep global CSS for tokens and base styles; style a component with Tailwind utilities.
- Match the surrounding visual language. Product pages are editorial and account/auth pages are shadcn; keep each screen in its own system.
- Keep focus states visible; replace an outline with another visible focus style.
- Prefer borders and tints over shadows.

## Accessibility

- Use a real `<button>` for actions and `<a>`/`<Link>` for navigation.
- Icon-only controls need `aria-label`.
- Toggles need `aria-pressed` or `aria-expanded`.
- Accordions need `aria-expanded` on the trigger, `aria-controls`, and a panel with `id` and `role="region"`.
- Images need alt text. Decorative images use `alt=""` and `aria-hidden`.
- Touch targets should be at least 44px on mobile.
- Respect `prefers-reduced-motion` for new animation.
- Pair color with text or an icon when conveying state.

## Performance

- Keep interactive islands small.
- Use `next/image` with `sizes`, and reserve `unoptimized` for blob URLs or remote images the optimizer cannot handle.
- Code-split heavy client-only libraries. Stripe already uses `dynamic(..., { ssr: false })`.
- Prefer ISR over client fetches for catalog data.
- Use the platform or an existing package before adding a dependency. The project keeps its dependency set small.

## Security

- No secret in a `NEXT_PUBLIC_*` variable.
- The Mailchimp key stays in the route handler.
- Keep WordPress admin tokens and refresh tokens server-side.
- Order lookup requires email plus optional ID, or a token. Keep the email in guest lookups.
- Treat client-computed totals as display-only. The checkout sends the selected method and cost for convenience; WordPress owns the final amount.
- Keep display-only features read-only against WordPress records.

## Tests

- The runner is Vitest, configured in `vitest.config.ts` with a Node environment and the `@` alias.
- Tests live beside the code as `*.test.ts`. `src/**/*.test.ts` is the include pattern.
- Test pure logic first: normalizers, formatters, filters, and fallback selection. These need no browser and no WordPress instance.
- `npm test` runs once; `npm run test:watch` watches.
- Fix the bug first, then add the test that keeps it fixed.
- Browser flows (add to cart, login reload, checkout, tracking, reviews) are still verified manually against the local WordPress site that serves as staging. When you add an end-to-end runner, keep it out of the unit suite and document how to seed the backend.

## Git

- Commits in this repository use conventional prefixes: `feat(scope):`, `fix(scope):`, `refactor(scope):`, `docs:`.
- Keep commits logical. A fix and an unrelated restyle belong in separate commits.
- Commit messages describe the user-visible effect, not the file list.
- Keep `.env.local`, `.next`, `node_modules`, and `tsconfig.tsbuildinfo` out of git.

## Definition of done

Before calling a change complete:

1. `npm run verify` passes: typecheck, lint, unit tests, the contrast check, and the one-export-per-component check.
2. `npm run verify:full` passes before committing when the change touches routing, data fetching, or dependencies. It adds the production build.
3. Empty, loading, and error states still render.
4. The change works on a narrow viewport, not only desktop.
5. Auth changes are tested signed out, signed in, after reload, and with an expired token.
6. Cart changes are tested as a guest, after login, and with an empty cart.
7. The relevant docs in this folder are updated if behavior changed.

CI runs the same `verify` and `build` on every pull request. Vercel is the preview, not the gate.

## Review checklist

- Does the change fetch data in the right layer?
- Does it respect the server/client boundary?
- Are API shapes normalized rather than cast?
- Are tokens kept out of client storage and logs?
- Are errors distinguished and surfaced with useful copy?
- Are optimistic updates reversible?
- Is the UI consistent with its page's visual language?
- Are interactive elements keyboard reachable and labeled?
- Did the change add a dependency, and is that justified?
- Did it leave the checkout, cart, and auth flows working?

## Related

- [architecture.md](architecture.md)
- [data-layer.md](data-layer.md)
- [state-management.md](state-management.md)
- [known-gaps.md](known-gaps.md)
- `.commandcode/taste/coding/taste.md`
