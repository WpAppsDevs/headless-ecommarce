# ADR-0001: Next.js App Router as the storefront

## Status

Accepted.

## Context

The shop needs SEO-friendly product pages, fast first paint, and a clear split between server-rendered catalog data and interactive commerce controls. WordPress already provides the catalog and order engine through a REST wrapper.

## Decision

Use Next.js 16 with the App Router. Pages are Server Components by default. Interactive parts are Client Components marked with `'use client'`. Catalog data is fetched during render and cached with ISR. Authenticated pages are client-rendered because the access token lives in memory.

The route tree uses a `(shop)` group for the home, products, and wishlist redirect so those routes can share organization without changing URLs.

## Alternatives considered

- **Pages Router.** Rejected. The team wanted nested layouts, async Server Components, and the current `next/font` and metadata APIs.
- **Client-side SPA with Vite.** Rejected. Product pages need server rendering and metadata for search and sharing.
- **WordPress theme with a JavaScript front end.** Rejected. The point of the project is a headless storefront; PHP must not own the page.
- **Astro or Remix.** Not evaluated in the repository. The existing code and dependencies are Next-specific.

## Consequences

- Server pages can call WordPress directly, which keeps their fetches free of CORS.
- Client pages need proxy routes for authenticated endpoints.
- `searchParams` and `params` are promises and must be awaited.
- Build-time data collection depends on WordPress being reachable; `getAllProductSlugs()` deliberately returns `[]` when the URL is missing so a deploy does not fail.
- The app has no middleware and no server-side auth guard. Protection is client redirects plus WordPress authorization.

## Related

- [architecture.md](../architecture.md)
- [routing-and-pages.md](../routing-and-pages.md)
