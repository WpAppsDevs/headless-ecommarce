# Getting started

## What you need

- Node.js 22.12 or newer on an even-numbered release (22, 24, or 26). Next.js 16 requires Node 20.9; `vitest` 5 excludes Node 23 and 25.
- npm. The lockfile is `package-lock.json`.
- A WordPress site running the WPAppsDev Headless Wrapper API, reachable over HTTP or HTTPS. Installing the plugin needs Composer and WP-CLI, or the Local app's terminal.
- Optional: a Stripe test publishable key and a Mailchimp audience, if you work on those paths.

The WordPress site and plugin are separate repositories. Only this front end is documented here.

## Backend setup

If someone already gave you a working WordPress URL, skip to [First run](#first-run) and set `NEXT_PUBLIC_WP_URL` to it. Otherwise install the wrapper plugin:

```bash
cd <wordpress-root>/wp-content/plugins
git clone https://github.com/WpAppsDevs/wpappsdev-headless-wrapper-api.git wpappsdev-headless-wrapper-api
cd wpappsdev-headless-wrapper-api
composer install --no-dev
wp plugin activate wpappsdev-headless-wrapper-api
```

The plugin requires WordPress 5.0+, an active WooCommerce plugin, PHP 8.0+, and pretty permalinks. With plain permalinks the REST routes are not reachable at `/wp-json`, which this app assumes.

On this machine the paired Local site is `Local Sites/headlessec` (WordPress) while the front end is `Local Sites/headlessecf/app/public`. The plugin checkout is `Local Sites/headlessec/app/public/wp-content/plugins/wpappsdev-headless-wrapper-api`.

Verify the API before starting the front end. Use the same origin you will put in `NEXT_PUBLIC_WP_URL`:

```bash
export WP_URL=http://headlessec.local
curl -s "$WP_URL/wp-json/wpadhlwrapi/v1/products?per_page=1"
curl -s "$WP_URL/wp-json/wpadhlwrapi/v1/store-settings"
curl -s -o /dev/null -w '%{http_code}\n' "$WP_URL/wp-json/api/user"   # expect 401
```

- A product JSON object means the plugin and WooCommerce are working.
- `404` on `/wp-json/...` usually means permalinks are set to Plain. Choose Settings → Permalinks → Post name.
- `401` on `/wp-json/api/user` is correct without a token; it proves the private namespace is registered.
- `rest_no_route` means the plugin is inactive or its namespace failed to register.

Before production, set a dedicated JWT secret in `wp-config.php`:

```php
define( 'HL_WRAPI_JWT_SECRET', 'a-long-random-string' );
```

The plugin documentation lives in its own repository: <https://github.com/WpAppsDevs/wpappsdev-headless-wrapper-api>.

## First run

```bash
npm install
# Copy only if the file does not exist; a working checkout may already have it.
test -f .env.local || cp .env.local.example .env.local
```

Edit `.env.local` and set at least:

```dotenv
NEXT_PUBLIC_WP_URL=http://headlessec.local
```

Then:

```bash
npm run dev
```

Open <http://localhost:3000>. The first run is done when `/products` shows at least one product, a product detail page opens, and the browser console has no CORS errors.

If the grid is empty, run the three `curl` checks in [Backend setup](#backend-setup) before changing code. A missing URL makes `getAllProductSlugs()` return `[]` by design, so the build succeeds while the catalog is empty.

## Environment variables

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_WP_URL` | Yes | `src/lib/config.ts` | WordPress origin, no trailing slash. `config.apiBase` appends `/wp-json`. |
| `NEXT_PUBLIC_STRIPE_PK` | For card checkout | `StripeForm.tsx` | Stripe publishable key. Without it, the card element cannot tokenize. |
| `NEXT_PUBLIC_SITE_NAME` | No | `config.ts`, footer, metadata | Defaults to `Najifa's Shop`. |
| `NEXT_PUBLIC_HERO_TITLE` | No | `config.ts` | Hero copy. |
| `NEXT_PUBLIC_HERO_SUBTITLE` | No | `config.ts` | Hero copy. |
| `NEXT_PUBLIC_HERO_CTA_TEXT` | No | `config.ts` | Hero button label. |
| `NEXT_PUBLIC_HERO_CTA_LINK` | No | `config.ts` | Hero button URL. |
| `NEXT_PUBLIC_WHATSAPP_URL` | No | `config.ts`, footer, hero fallback | Defaults to `https://wa.me/8801841654663`. |
| `NEXT_PUBLIC_FACEBOOK_URL` | No | `config.ts`, footer, announcement bar | Defaults to the shop's Facebook page. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | `config.ts`, footer, announcement bar | Defaults to the shop's Instagram profile. |
| `MAILCHIMP_API_KEY` | For newsletter | `src/app/api/newsletter/route.ts` | Must include the datacenter suffix, for example `abc-us21`. |
| `MAILCHIMP_AUDIENCE_ID` | For newsletter | same route | Without both Mailchimp values the route returns 503. |
| `ERROR_REPORT_WEBHOOK_URL` | No | `src/app/api/errors/route.ts` | Server-only. Forwards client error reports as JSON. Reports still go to server logs without it. |

`.env.local.example` is the storefront example. The root `.env.example` is a leftover Taskmaster template full of AI provider keys; it is not used by this app.

`NEXT_PUBLIC_*` values are embedded in the client bundle. Keep secrets in server-only variables.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server with fast refresh. |
| `npm run build` | Production build. Also runs type checking and page data collection. |
| `npm run start` | Serve a completed production build. |
| `npm run lint` | ESLint with the Next core-web-vitals and TypeScript configs. |
| `npm test` | Run the Vitest unit suite once. |
| `npm run test:watch` | Run Vitest in watch mode while editing. |

The default gates live in [coding-standards.md](coding-standards.md#definition-of-done); run them before a pull request. Browser flows are still checked manually against the staging WordPress site; see [coding-standards.md](coding-standards.md#tests).

## A five-minute tour

1. `src/app/layout.tsx` — fonts, metadata, hydrators, header, cart drawer, footer.
2. `src/app/(shop)/page.tsx` — home page composition; most sections are static components, products come from `getProducts`.
3. `src/app/(shop)/products/page.tsx` — server page that loads products and filters, then hands them to `ShopClient`.
4. `src/lib/api/products.ts` — the best example of the API layer: raw types, normalization, and ISR.
5. `src/stores/cartStore.ts` — the best example of client state: optimistic add, guest token handling, error messages.
6. `src/app/api/` — every server-side proxy. Read `auth/login/route.ts`, `checkout/route.ts`, and `wishlist/route.ts` to see the three patterns.

## How to make a change

**Change copy or layout on a static page.** Edit the page or section component. Policy pages live in `src/app/shipping`, `returns`, `privacy-policy`, and `terms`; they share the components under `src/components/policies/`.

**Add a product field.** Add it to the API type and normalizer in `src/lib/api/products.ts`, then consume it in the component. Keep raw API shapes in the API layer; components consume normalized types.

**Add an authenticated endpoint.** Add a route handler under `src/app/api/<domain>/route.ts` that forwards the `Authorization` header, then call that route from `src/lib/api/<domain>.ts`. Call protected endpoints through the route handler; direct browser calls cause the CORS problems the proxies exist to avoid.

**Add a client store action.** Put the network call in `src/lib/api/`, keep Zustand for state and orchestration, and let the store return errors through its `error` field or a thrown `ApiError`.

**Change brand colors or fonts.** Edit the tokens in `src/app/globals.css`. Components use `bg-brand-*`, `text-brand-*`, and `font-serif`. See [design-system.md](design-system.md).

A change is complete when the gates in [coding-standards.md](coding-standards.md#definition-of-done) pass and the affected doc is updated.

## Troubleshooting

**Products are empty and the server log shows a fetch failure.** `NEXT_PUBLIC_WP_URL` is unset or wrong. `getAllProductSlugs()` returns `[]` when the variable is missing, so a deployment can build successfully with no pre-rendered products.

**The browser console shows CORS errors.** The endpoint you are calling is not proxied. Use the matching route under `/api` or add one. Existing proxies strip nothing: they forward the bearer token and response body as-is.

**Every page redirects to `/login`.** A stale guest cart token is being retried. The auth store handles this case, but an old token can still sit in `localStorage['cart_token']`. Clear site data and reload.

**Login succeeds but the account page bounces back.** The refresh cookie is blocked. Cookies are `httpOnly`, `sameSite=lax`, and `secure` in production. On plain HTTP, `secure` cookies are rejected; use HTTPS or run in development mode.

**Card form never appears.** `NEXT_PUBLIC_STRIPE_PK` is missing. `StripeForm` is dynamically imported with `ssr: false`, so the failure is client-side.

**Newsletter form returns 503.** `MAILCHIMP_API_KEY` or `MAILCHIMP_AUDIENCE_ID` is unset. This is an intentional configuration error, not a Mailchimp outage.

**Images from WordPress do not render.** `next.config.ts` allows all HTTPS and HTTP hosts, so the usual causes are a broken image URL or the API returning `url` where the client expects `src`. The product normalizer already accepts both fields; check the raw response before editing it again.

## Next

- [architecture.md](architecture.md) for how the pieces fit.
- [project-structure.md](project-structure.md) for where things live.
- [coding-standards.md](coding-standards.md) before opening a pull request.
