# ADR-0005: Brand tokens with a mixed visual language

## Status

Accepted.

## Context

The storefront needs a warm editorial identity for shopping pages and a neutral, familiar interface for account and auth pages. The app also uses shadcn components, which expect their own CSS variables. Repeating hex values across components caused drift and made a palette change expensive.

## Decision

Define brand tokens in `src/app/globals.css` and expose them to Tailwind through `@theme inline`.

- `--brand-*` variables hold the palette.
- Tailwind utilities such as `bg-brand-accent` and `text-brand-text` are generated from those variables.
- shadcn/base-ui variables (`--background`, `--primary`, `--border`, `--ring`, …) point at the brand values, so stock components inherit the palette.
- Two visual languages are allowed: the editorial product style and the shadcn account style. Each page follows one.
- Fonts are loaded with `next/font/google`: Playfair Display for serif headings, Inter for scoped UI text, Geist for the base sans.

## Alternatives considered

- **One global shadcn theme.** Rejected. It would make product pages look like an admin dashboard and lose the editorial identity.
- **CSS-in-JS theme provider.** Rejected. Tailwind 4 and CSS variables cover the need without a runtime.
- **Per-component color literals.** Rejected as the target, although product-detail components still contain some approved one-off hex values.

## Consequences

- A palette change is one edit in `:root`.
- A new token must be added in both `:root` and `@theme inline` to become a utility.
- The product-detail style has hardcoded maroon, navy, and cream values that do not all use tokens yet. Migrate them when touching those files.
- Dark mode has no token block and no toggle. Only dormant `dark:` utilities remain from shadcn defaults, so it is not a supported theme today.
- The two visual languages are intentional. Do not unify them without a product decision.

## Related

- [design-system.md](../design-system.md)
- [components.md](../components.md)
