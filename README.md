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

```bash
npm install
cp .env.local.example .env.local
```

Set the WordPress origin in `.env.local`:

```dotenv
NEXT_PUBLIC_WP_URL=http://headlessecf.local
NEXT_PUBLIC_STRIPE_PK=pk_test_...
```

Then:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build, including type checking |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npx tsc --noEmit` | Type check only |

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

Most useful first reads:

- [Getting started](docs/getting-started.md) — environment, scripts, troubleshooting.
- [Architecture](docs/architecture.md) — how the browser, Next.js, and WordPress fit together.
- [Project structure](docs/project-structure.md) — where files live and where new ones go.
- [Coding standards](docs/coding-standards.md) — conventions and definition of done.
- [Known gaps](docs/known-gaps.md) — current limitations, including the WordPress endpoints still missing.
- [Fix plan](docs/fix-plan.md) — the remediation work already applied, kept as a reference for the backend items.
- [GLOSSARY.md](GLOSSARY.md) — shared vocabulary.

Architecture decisions are in [docs/adr/](docs/adr/).

## Repository scope

This repository is the staging checkout at `Local Sites/headlessecf/app/public`. It contains the front end only. The WordPress site and its plugins live outside this repository. `ApiDocs.md` and `CodeDocs.md` are older references; `docs/` is the maintained documentation.

## Status

Type checking, lint, the unit suite, and the production build pass. Signed-in sessions survive a full reload through the `session_hint` cookie and refresh flow. The remaining open work is mostly WordPress API gaps; see [known-gaps.md](docs/known-gaps.md).
