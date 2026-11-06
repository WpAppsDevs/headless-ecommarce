# Documentation

These docs describe the storefront in this repository. They are written from the source, not from older prose documents. Where the code and an older document disagree, the code wins.

`docs/` replaces the root `CodeDocs.md` as the maintained reference. `ApiDocs.md` is still useful as an upstream contract reference, but it describes the WordPress plugin and can drift from what this client actually calls.

## Start here

| If you are… | Read |
| --- | --- |
| New to the project | [getting-started.md](getting-started.md), then [architecture.md](architecture.md) |
| Looking for a file | [project-structure.md](project-structure.md) |
| Working on a page or route | [routing-and-pages.md](routing-and-pages.md) |
| Working on data fetching | [data-layer.md](data-layer.md) |
| Working on cart, auth, or client state | [state-management.md](state-management.md) |
| Working on UI | [components.md](components.md), [design-system.md](design-system.md) |
| Reviewing or writing code | [coding-standards.md](coding-standards.md) |
| Deploying or configuring secrets | [operations.md](operations.md) |
| Picking up known debt | [known-gaps.md](known-gaps.md) |

## Deeper flows

- [flows/authentication.md](flows/authentication.md) — tokens, cookies, hydration, guest-cart merge.
- [flows/cart-and-checkout.md](flows/cart-and-checkout.md) — add to cart through order confirmation.
- [flows/reviews.md](flows/reviews.md) — read, write, moderate, and attach media.
- [flows/order-tracking.md](flows/order-tracking.md) — guest email lookup and authenticated order lookup.

## Decisions

Architecture decisions live in [adr/](adr/). Each ADR records the decision, the alternatives, and the consequences that are visible in the code today.

## Diagrams

- [diagrams/storefront-architecture.png](diagrams/storefront-architecture.png) — request paths between the browser, Next.js, WordPress, and third parties. Source: [diagrams/storefront-architecture.html](diagrams/storefront-architecture.html).
- [diagrams/checkout-flow.png](diagrams/checkout-flow.png) — sign-in, cart, form, and order result branches. Source: [diagrams/checkout-flow.html](diagrams/checkout-flow.html).

## Conventions in these docs

- File paths are relative to the repository root.
- "The storefront" means this Next.js app. "WordPress" means the wrapper API behind `NEXT_PUBLIC_WP_URL`.
- Code samples are excerpts, not files to paste whole.
- `→` in a flow means a user or code action, not a promise about timing.
