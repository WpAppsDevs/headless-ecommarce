# Operations

## Environments

| Environment | Front end | WordPress |
| --- | --- | --- |
| Local | `npm run dev`, usually `http://localhost:3000` | Local site, e.g. `http://headlessec.local` |
| Production | Vercel or another Next.js host | Public wrapper API, e.g. `https://api.example.com` |

There is no separate staging deployment in this repository. The local checkout doubles as the staging copy. A production deploy needs its own WordPress URL and Stripe key.

## Production configuration

The full variable list, including local values, is in [getting-started.md](getting-started.md#environment-variables). `package.json` and the route handlers are the code-level source.

For production:

- Public `NEXT_PUBLIC_*` values live in `.env.production`, which is tracked because it contains no secrets. Next.js loads `.env.local` first, then `.env.<NODE_ENV>`, then `.env`; a local override wins.
- Server-only values belong in the host environment: `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, and `ERROR_REPORT_WEBHOOK_URL`.
- `ERROR_REPORT_WEBHOOK_URL` is optional. `/api/errors` forwards client reports there after writing them to the server log. Without it, reports stay in the hosting provider's function logs.

After changing a `NEXT_PUBLIC_*` value, rebuild and redeploy. Runtime changes do not update an existing build.

## Build and release

```bash
npm ci
npm run build
npm run start
```

Run `npm run verify` before the build. `npm run build` also performs type checking and collects page data. It calls WordPress while generating static params and product pages. If WordPress is down, the build can still succeed with fewer pre-rendered pages, but the output will be thin. Check the build log for failed fetches.

`shadcn` is a devDependency: it supplies build-time CSS and is not needed by the running server. A build host must install dev dependencies (`npm ci`, not `npm ci --omit=dev`). A production-only install is safe after the build, when running `next start`.

GitHub Actions runs `npm run verify`, `npm run build`, `npm run check:routes` and `npm run audit:prod` on every pull request and on pushes to `master`. `verify` includes `check:untranslated`, so an English literal or a `<form>` without `method="post"` fails the gate rather than reaching a visitor. Vercel provides the preview deployment; CI is the merge gate.

## Browser tests behind the login

`check:routes` reads HTTP responses, so every screen behind a session is invisible to it: the account tabs, order details, checkout validation. Those are where English copy and a broken branch shipped unnoticed, so they are covered by Playwright instead.

```console
$ npm run build                     # the suite serves the built app
$ E2E_EMAIL=… E2E_PASSWORD=… npm run test:e2e
```

- `e2e/account.spec.ts` signs in with a **customer** account (not an administrator), switches the locale cookie to Bangla, and asserts the account tabs, one order card, the order-details modal and the language flag. A session-survives-language-switch case runs last.
- Credentials come from `E2E_EMAIL` / `E2E_PASSWORD` only. With either missing every test skips, so a checkout without the secret stays green rather than failing for the wrong reason. The same applies in CI: add the two repository secrets to enable the job's browser step.
- The suite reads a live WordPress. The account test asserts that an order exists, never how many, and the checkout test walks the shop until a product can be added, skipping if none can. Hard-coded ids would rot against real data.
- `e2e-open` status on the shop means the test cannot run: when every product is sold out there is no way to fill a cart.
- `e2e/staff-products.spec.ts` covers the staff dashboard: it signs in at `/studio/login`, creates a draft with a real image, finds it under Drafts and trashes it. It needs `E2E_STAFF_EMAIL` / `E2E_STAFF_PASSWORD` (a `product_uploader` account) and skips without them.
- Do not start the suite while a WordPress plugin deploy is running: the deploy swaps the plugin directory, so REST calls fail for a few seconds and unrelated login assertions go red.

## Advisories

`npm run audit:prod` is the gate: it audits production dependencies only and fails on high or critical. It reports zero, and CI runs it on every pull request.

`npm audit` without `--omit=dev` reports 22 findings, all in build and test tooling. Every one of them is a path to a single package, `picomatch`, whose latest release (4.0.7) is still in the vulnerable range, so no fix exists to apply. `npm audit fix` does not reduce the count, and `npm audit fix --force` only reaches it by downgrading `vitest` 5 → 3.1.4 and `shadcn` 4 → 2.10, which is a worse trade than the advisory.

Re-check after `picomatch` publishes a release outside the vulnerable range; `fdir` and `minimatch` already carry fixes that arrive with it. Until then the dev-only count is expected, and a pull request that leaves it unchanged is not a regression.

## Pull requests and merge gate

Open pull requests against `master`. Vercel is the preview, not the gate; the required check is the `verify` job.

- The active ruleset is **Main Branch Rule**. It requires `verify` with strict up-to-date checks, and blocks force pushes and branch deletion. Renaming the CI job requires updating the ruleset.
- Editing `.github/workflows/*` needs the `workflow` token scope. Refresh it with `gh auth refresh -s workflow`.
- `gh pr merge` occasionally fails with `net/http: TLS handshake timeout` against api.github.com. It is transient: re-run the same command. Confirm with `gh pr view <n> --json state` rather than assuming either outcome.
- For a stacked pull request, retarget the base to `master` and rebase after the parent merges. Otherwise the child PR still contains the parent's commits.
- Put a long PR body in a file and pass it with `--body-file`; the repository template is `.github/pull_request_template.md`.

## Vercel

1. Import the repository.
2. Set the environment variables for Production and Preview.
3. Use the default Next.js build command.
4. Point the domain at the deployment.
5. Verify `https://<domain>/products` returns products, not an empty grid.
6. Complete one BACS checkout and one Stripe test checkout.

`next.config.ts` allows images from any HTTP or HTTPS host. That keeps WordPress media working without an allowlist, but it also means any remote image URL is accepted. Tighten it to the WordPress host if the media domain is stable.

## Cookies and HTTPS

Cookie names, lifetimes, and flags are documented in [flows/authentication.md](flows/authentication.md). Production consequences:

- Serve over HTTPS; a `secure` cookie on plain HTTP is rejected, so login appears to succeed but does not persist.
- The frontend and WordPress can be on different hosts. Cookies belong to the frontend host.
- A custom domain change invalidates existing sessions.

## WordPress requirements

The frontend assumes:

- The WPAppsDev Headless Wrapper API plugin is active.
- `/wp-json/wpadhlwrapi/v1` and `/wp-json/api` respond.
- CORS allows the storefront origin for direct browser calls (cart, public catalog).
- Permalinks are enabled; otherwise REST routes may 404.
- The Stripe gateway is configured if card payments are enabled.
- The password-reset URL points at the storefront, not wp-admin.
- The `primary` menu location exists if the site should use CMS navigation.
- `checkout-draft` orders are a real status produced by the checkout flow.

If direct cart calls fail with CORS while proxied calls work, the WordPress CORS configuration is the place to look, not the Next.js code.

## Stripe

- Publishable key: `NEXT_PUBLIC_STRIPE_PK`.
- Secret key: WordPress, outside this repository.
- The browser creates a PaymentMethod; WordPress charges it.
- Test with `pk_test_...` and Stripe test cards before switching to live keys.

If the card element is blank, check the key and the browser console. The component is dynamically imported and will not render during SSR.

## Mailchimp

`/api/newsletter` requires `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID`. The key must include its datacenter suffix (`...-us21`); the route derives the API host from it.

Without both values, the route returns 503 with "Newsletter service is not configured." That is intentional.

The route treats "Member Exists" as success. It does not double opt-in; the member is created with `status: 'subscribed'`.

## Caching and revalidation

Cache layers and TTLs live in [architecture.md](architecture.md#caching). After a WordPress content change, expect up to the TTL before the storefront reflects it. To force a refresh, redeploy or wait; there is no on-demand revalidation webhook.

On the WordPress host, keep `wp-json/api/*` out of the page cache (LiteSpeed: **Do Not Cache URIs**). Those are authenticated responses; a cached 404 or 401 outlives the deploy that fixed it and makes a working endpoint look broken.

## Monitoring

There is no third-party error service wired in. `error.tsx` and `ErrorReporter` send reports to `/api/errors`, which writes them to the server log and forwards to `ERROR_REPORT_WEBHOOK_URL` when set. Next.js digests are included when present.

Minimum checks after a deploy:

- Home page renders hero and at least one product.
- `/products` renders products and filters.
- A product page renders images, variations, and reviews.
- Add to cart works as a guest.
- Login works and the header shows the account state.
- `/account` loads orders.
- Checkout reaches the confirmation page.
- Newsletter returns success or a clear configuration error.
- `/track-order` finds an order by email.

## Rollback

The app is stateless. Roll back by redeploying the previous build. WordPress data is not part of the frontend release; a frontend rollback does not undo orders or reviews.

If a release changed cookie behavior, users may need to sign in again. If it changed `NEXT_PUBLIC_WP_URL`, expect cached pages to point at the old API until revalidation.

## Backups

The frontend has no database. Back up WordPress and its database separately. The only frontend-side state is in browser storage (`cart_token`, `wishlist_ids`, one `sessionStorage` order result), which is disposable.

## Security checklist

- No secrets in `NEXT_PUBLIC_*`.
- HTTPS in production.
- Refresh token only in an httpOnly cookie.
- Cookies not loosened without a review.
- WordPress REST permissions verified for every authenticated route.
- Order lookup requires email plus ID, or a token.
- Image host allowlist tightened if the media domain is stable.
- Dependencies reviewed before adding.

## Related

- [getting-started.md](getting-started.md)
- [architecture.md](architecture.md)
- [data-layer.md](data-layer.md)
- [known-gaps.md](known-gaps.md)
