# Headless ECF Storefront

A Next.js storefront for a WooCommerce catalog, built for Najifa's Shop. WordPress owns products, carts, orders, users, reviews, and shipping data. This app owns the interface and the client-side commerce state.

## Stack

- Next.js 16, App Router, React 19, TypeScript strict
- Tailwind CSS 4 with shadcn/base-nova components
- Zustand for auth, cart, wishlist, review-session, and currency state
- react-hook-form and zod for forms
- Stripe.js for card tokenization
- WordPress WPAppsDev Headless Wrapper API as the backend

## Quick start

You need a WordPress site running the [WPAppsDev Headless Wrapper API](https://github.com/WpAppsDevs/wpappsdev-headless-wrapper-api). If you do not already have one, follow [Backend setup](docs/getting-started.md#backend-setup).

```bash
npm install
# Copy only if the file does not exist; a working checkout may already have it.
test -f .env.local || cp .env.local.example .env.local
```

Set the WordPress origin in `.env.local`:

```dotenv
NEXT_PUBLIC_WP_URL=http://headlessec.local
NEXT_PUBLIC_STRIPE_PK=pk_test_...
```

Then:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Scripts

Run `npm run dev` for local work. `package.json` is the full command list; [getting-started.md](docs/getting-started.md#scripts) explains the build, lint, and test gates.

## What is in the app

- Home page with merchandising sections and a server-rendered featured grid.
- Shop with server-side category/tag/brand/search filters and client-side price/color/size filters.
- Product detail with image gallery, variations, stock state, tabs, reviews, and related products.
- Guest cart with a local guest token, merged into the user cart on login.
- Checkout with BACS and Stripe gateways, country/state selects, and shipping methods.
- Account dashboard, order history, wishlist, addresses, and settings.
- Guest and authenticated order tracking.
- Bengali shipping, returns, privacy, and terms pages.
- Newsletter signup through Mailchimp.

## Documentation

Start at [docs/README.md](docs/README.md).

The index maps tasks to docs. For a first pass, read [getting-started.md](docs/getting-started.md) and [architecture.md](docs/architecture.md). Shared vocabulary is in [GLOSSARY.md](GLOSSARY.md).

Architecture decisions are in [docs/adr/](docs/adr/).

## Repository scope

This repository is the staging checkout at `Local Sites/headlessecf/app/public`. It contains the front end only. The WordPress site and its plugins live outside this repository. `ApiDocs.md` and `CodeDocs.md` are older references; `docs/` is the maintained documentation.

## Status

Type checking, lint, the unit suite, and the production build pass. Signed-in sessions survive a full reload through the `session_hint` cookie and refresh flow. The remaining open work is mostly WordPress API gaps; see [known-gaps.md](docs/known-gaps.md).
