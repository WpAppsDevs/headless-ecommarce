# Coding standards

These rules describe how the codebase is written today and where it is going. Follow them for new code. When a rule and the code disagree, treat the rule as the target and note the deviation in the change.

## TypeScript

- `strict` is on. Do not weaken `tsconfig.json`.
- Path alias: `@/*` maps to `src/*`. Use it for cross-folder imports.
- Prefer explicit return types on exported API functions and store actions. Small components can infer.
- Do not add `any`. The one existing `any` is in `Address.tsx`; do not copy it. Use `unknown` plus a type guard at the boundary, or define a narrow interface.
- API payloads are untrusted. Type the expected shape, then normalize; do not cast a raw response straight into a domain type.
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

One component per file. Split a file when it grows past roughly 300 lines or mixes more than one responsibility. `CheckoutForm.tsx` at 769 lines is the current exception, not the template.

## Server and client boundaries

Start with a Server Component. Add `'use client'` only for:

- state or effects,
- event handlers,
- browser APIs (`localStorage`, `window`, `IntersectionObserver`),
- client-only libraries (Stripe.js),
- Zustand.

Do not mark a whole page client just to make one button interactive. Extract the interactive part.

Server Components can:

- read `searchParams` and `params` (they are promises in Next 16),
- call API modules,
- fetch WordPress directly,
- set `revalidate` and `metadata`.

Server Components in this codebase do not read auth cookies. Authenticated screens are client pages that wait for `authStore.hydrated`.

## Data fetching

- Put remote calls in `src/lib/api/<domain>.ts`. Do not fetch from a component.
- Use `apiClient` for the standard `{ success, data }` contract.
- Use raw `fetch` when you need pagination `meta`, a status code, multipart, or a non-standard body. Document why in a comment.
- Choose the right runtime branch: browser → proxy, server → direct. Keep both branches unless the function is server-only.
- Normalize at the boundary. The API may return `{}` for empty arrays or `url` instead of `src`; handle it once in the API module.
- Set a revalidation policy deliberately. If the data should be fresh, use `cache: 'no-store'`; if it is catalog data, use ISR.
- Catch and degrade on server pages. Empty products, empty filters, and missing menus are recoverable; a thrown error is not.
- Do not duplicate the same fetch in a page and its child components. Pass the data down or lift the fetch.

## API and route handlers

- A route handler is a proxy, not a security boundary. Forward the caller's bearer token; let WordPress authorize.
- Forward the request body as-is unless you have a reason to reshape it. For JSON, `await req.json()`; for multipart, `await req.formData()` and do not set `Content-Type`.
- Return the upstream status when you forward an error. Do not turn every failure into 200.
- The generic catch returns `{ success: false, code: 'server_error', message: 'Internal server error' }` with 500. Keep that shape.
- Never log or return tokens.
- Auth cookies are `httpOnly`, `sameSite: 'lax'`, `path: '/'`, and `secure` in production. Do not loosen them.
- The refresh token never goes to client JavaScript. Only the access token is returned by login/register/refresh.
- When a proxy changes data (orders filtering drafts), adjust pagination too. Hiding rows without adjusting `total` produces empty last pages.
- One proxy per resource. Do not create a catch-all `/api/[...path]` route; explicit handlers are easier to audit.

## Errors

Use `ApiError` for API failures:

```ts
throw new ApiError('out_of_stock', 'This item is out of stock');
```

- Preserve the backend `code` when it is meaningful. Map known codes to user-facing copy at the form, not in the API layer.
- Distinguish not found, auth failure, validation failure, and network failure. Do not collapse them into "not found".
- Stores keep a human message in `error`; they do not throw unless the caller needs to react. Cart add is the example: it stores the error and the component reads it after awaiting.
- Forms use `setError('root', …)` for form-level errors and inline messages for fields.
- A failed optional section should render nothing, not a broken box. `RelatedProducts`, filters, menus, and rating aggregates follow this rule.

## State

- Put server data in the API layer and UI state in Zustand.
- One store per domain. Do not add a store for a single component.
- Optimistic updates need rollback and a `finally` cleanup for pending flags.
- Keep hydration idempotent. Hydrators use a ref guard; do not remove it.
- Avoid importing `authStore` from cart or wishlist. The dependency direction is auth → others.
- Do not persist the access token. Do not put the refresh token in JavaScript-readable storage.

## Forms

- Use `react-hook-form` with `zodResolver`.
- Define the schema next to the form. Export it only if another file needs it.
- Validate on submit. Do not add a validation library for a single field.
- Keep API error messages separate from field validation messages.
- Disable the submit button while submitting and restore it in `finally`.
- For checkout, keep the zod schema and the payload builder in sync. A field that validates but is not sent is a bug.

## Styling

- Use brand tokens and Tailwind utilities.
- Use `cn()` for conditional classes.
- Do not add a CSS file per component. Global CSS is for tokens and base styles.
- Match the surrounding visual language. Product pages are editorial; account and auth pages are shadcn. Do not blend them by accident.
- Keep focus states. Do not remove outlines without a replacement.
- Prefer borders and tints over shadows.

## Accessibility

- Use a real `<button>` for actions and `<a>`/`<Link>` for navigation.
- Icon-only controls need `aria-label`.
- Toggles need `aria-pressed` or `aria-expanded`.
- Accordions need `aria-expanded` on the trigger, `aria-controls`, and a panel with `id` and `role="region"`.
- Images need alt text. Decorative images use `alt=""` and `aria-hidden`.
- Touch targets should be at least 44px on mobile.
- Respect `prefers-reduced-motion` for new animation.
- Do not use color alone to convey state. Add text or an icon.

## Performance

- Keep interactive islands small.
- Use `next/image` with `sizes`; avoid `unoptimized` unless the source is a blob URL or a remote image that cannot be optimized.
- Code-split heavy client-only libraries. Stripe already uses `dynamic(..., { ssr: false })`.
- Prefer ISR over client fetches for catalog data.
- Do not add a dependency for something the platform or an existing package already does. The project has a deliberately small dependency set.

## Security

- No secret in a `NEXT_PUBLIC_*` variable.
- The Mailchimp key stays in the route handler.
- Never expose a WordPress admin token or a refresh token to the browser.
- Order lookup must require more than an order ID. The tracking endpoint is designed around email plus optional ID. Do not add a "lookup by ID only" shortcut on the client.
- Do not trust client-computed totals. The checkout sends the selected method and cost for convenience; WordPress owns the final amount.
- Do not delete or mutate WordPress records from a display-only feature.

## Tests

- The runner is Vitest, configured in `vitest.config.ts` with a Node environment and the `@` alias.
- Tests live beside the code as `*.test.ts`. `src/**/*.test.ts` is the include pattern.
- Test pure logic first: normalizers, formatters, filters, and fallback selection. These need no browser and no WordPress instance.
- `npm test` runs once; `npm run test:watch` watches.
- Do not encode a known bug as expected behavior. Fix the bug, then add the test that keeps it fixed.
- Browser flows (add to cart, login reload, checkout, tracking, reviews) are still verified manually against the staging WordPress site. When you add an end-to-end runner, keep it out of the unit suite and document how to seed the backend.

## Git

- Commits in this repository use conventional prefixes: `feat(scope):`, `fix(scope):`, `refactor(scope):`, `docs:`.
- Keep commits logical. A fix and an unrelated restyle belong in separate commits.
- Commit messages describe the user-visible effect, not the file list.
- Do not commit `.env.local`, `.next`, `node_modules`, or `tsconfig.tsbuildinfo`.

## Definition of done

Before calling a change complete:

1. `npx tsc --noEmit` passes.
2. `npm run build` succeeds if the change touches routing, data fetching, or dependencies.
3. `npm run lint` passes with no errors.
4. `npm test` passes, and new pure logic has a colocated test.
5. Empty, loading, and error states still render.
6. The change works on a narrow viewport, not only desktop.
7. Auth changes are tested signed out, signed in, after reload, and with an expired token.
8. Cart changes are tested as a guest, after login, and with an empty cart.
9. The relevant docs in this folder are updated if behavior changed.

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
