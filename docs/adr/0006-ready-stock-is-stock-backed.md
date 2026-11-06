# ADR-0006: Ready Stock is stock-backed, not just a tag

## Status

Accepted.

## Context

The storefront exposes Ready Stock, Pre-Order, and Catalog as product collections through WooCommerce tags. Stock lives per variation, so a product-level tag can claim availability while every variation is sold out. That is the current state: every product in the Ready Stock collection is out of stock. A tag also cannot represent a variable product with one purchasable size and one sold-out size.

## Decision

Ready Stock is a view over products tagged `ready-stock` that have at least one purchasable variation. A product that sells out leaves the Ready Stock collection and keeps a reachable product page with a sold-out state. Pre-Order remains a purchase mode identified by its tag, not a stock status. Catalog is a B2B asset, not a product collection.

## Consequences

- The `ready-stock` tag is necessary but not sufficient; the storefront must also check availability.
- A sold-out product can be absent from Ready Stock while remaining reachable and indexed through other routes.
- Sold-out products stay visible in the general catalog and category pages with a sold-out state. Only Ready Stock excludes them.
- When Ready Stock has nothing purchasable, the storefront keeps its navigation entry, switches the hero's primary action to Pre-Order, and gives the collection a pre-order fallback instead of a bare empty state.
- The storefront reads the product-level stock status that WooCommerce aggregates from its variations. If that aggregate ever disagrees with the variation detail, the variation detail is authoritative.
- Pre-Order is labelled from its purchase mode, not from stock status, so a pre-order product is never presented as Sold out.

## Related

- [GLOSSARY.md](../../GLOSSARY.md)
- [design-system.md](../design-system.md)
