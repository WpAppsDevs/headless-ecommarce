# Operations

## Environments

| Environment | Front end | WordPress |
| --- | --- | --- |
| Local | `npm run dev`, usually `http://localhost:3000` | Local site, e.g. `http://headlessecf.local` |
| Production | Vercel or another Next.js host | Public wrapper API, e.g. `https://api.example.com` |

There is no separate staging deployment in this repository. The local checkout doubles as the staging copy. A production deploy needs its own WordPress URL and Stripe key.

## Required configuration

Set these in the host's environment settings, not in a committed file.

```dotenv
NEXT_PUBLIC_WP_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_PK=pk_live_...
NEXT_PUBLIC_SITE_NAME=Najifa's Shop
```

Optional:

```dotenv
NEXT_PUBLIC_HERO_TITLE=...
NEXT_PUBLIC_HERO_SUBTITLE=...
NEXT_PUBLIC_HERO_CTA_TEXT=...
NEXT_PUBLIC_HERO_CTA_LINK=/products
MAILCHIMP_API_KEY=...
MAILCHIMP_AUDIENCE_ID=...
ERROR_REPORT_WEBHOOK_URL=...
```

`ERROR_REPORT_WEBHOOK_URL` is optional and server-only. When set, `/api/errors` forwards client error reports to it as JSON after writing them to the server log. Any collector or chat webhook that accepts JSON works. Without it, reports still appear in the hosting provider's function logs.

`NEXT_PUBLIC_*` values are compiled into the client bundle. After changing one, rebuild and redeploy; changing it at runtime does not update an existing build.

## Build and release

```bash
npm ci
npm test
npx tsc --noEmit
npm run lint
npm run build
npm run start
```

`npm run build` also performs type checking and collects page data. It calls WordPress while generating static params and product pages. If WordPress is down, the build can still succeed with fewer pre-rendered pages, but the output will be thin. Check the build log for failed fetches.

The repository does not include CI configuration. Treat the commands above as the release gate.

## Vercel

1. Import the repository.
2. Set the environment variables for Production and Preview.
3. Use the default Next.js build command.
4. Point the domain at the deployment.
5. Verify `https://<domain>/products` returns products, not an empty grid.
6. Complete one BACS checkout and one Stripe test checkout.

`next.config.ts` allows images from any HTTP or HTTPS host. That keeps WordPress media working without an allowlist, but it also means any remote image URL is accepted. Tighten it to the WordPress host if the media domain is stable.

## Cookies and HTTPS

Auth cookies are `httpOnly`, `sameSite=lax`, `path=/`, and `secure` when `NODE_ENV=production`.

Consequences:

- Production must be served over HTTPS. A `secure` cookie on plain HTTP is rejected, and login will appear to succeed but the session will not persist.
- The frontend and WordPress can be on different hosts. The cookies belong to the frontend host.
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
- Secret key: WordPress, never this repository.
- The browser creates a PaymentMethod; WordPress charges it.
- Test with `pk_test_...` and Stripe test cards before switching to live keys.

If the card element is blank, check the key and the browser console. The component is dynamically imported and will not render during SSR.

## Mailchimp

`/api/newsletter` requires `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID`. The key must include its datacenter suffix (`...-us21`); the route derives the API host from it.

Without both values, the route returns 503 with "Newsletter service is not configured." That is intentional.

The route treats "Member Exists" as success. It does not double opt-in; the member is created with `status: 'subscribed'`.

## Caching and revalidation

| Layer | What | TTL |
| --- | --- | --- |
| Next.js fetch cache | products, filters, menus, reviews aggregate/random | 60 s to 6 h |
| Route handler cache | store settings | 1 h |
| CDN headers | store settings, product filters | `s-maxage` + stale-while-revalidate |
| Browser | most authenticated data | no-store |

After a WordPress content change, expect up to the TTL before the storefront reflects it. To force a refresh, redeploy (clears the build cache) or wait. There is no on-demand revalidation webhook.

## Monitoring

There is no error reporting service wired in. `error.tsx` logs to the console and shows a digest when Next.js provides one.

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
