# ADR-0008: Locale in a cookie, not in the URL

## Status

Accepted. The Bangla search-visibility trade-off is deliberate and may be revisited.

## Context

The site had one language per surface rather than one per visitor: the five support pages and the footer help column were written in Bangla and hardcoded, while the announcement bar, header nav, homepage, shop, and all commerce surfaces were English. `lang="en"` was hardcoded on `<html>`.

Adding a language switcher forced a choice between putting the locale in the URL (sub-path or sub-domain, the approach the Next.js internationalization guide demonstrates with `app/[lang]`) and keeping it in a cookie.

## Decision

The locale lives in a `locale` cookie, read in the root layout, with English as the default. One URL serves both languages.

- No `[locale]` segment across the 18 routes, no proxy rewrite, no `hreflang` and no per-locale sitemap.
- The switcher writes the cookie and calls `router.refresh()`; the URL never changes.
- The cookie is not `httpOnly` because the browser writes it. It carries a language, not a credential.
- Locale reaches components through a React Context provided by the root layout, not a Zustand store: the cookie is the source of truth and the server already knows its value at render time.
- Translations are `en.ts` / `bn.ts` message maps read by `getDictionary(locale)`, with `Intl` (`en`, `bn-BD`) formatting every number the UI computes — counts, the copyright year, shipping charges — through `src/i18n/format.ts`. No i18n library.

## Alternatives considered

- **`/bn/*` sub-path with English unprefixed.** The conventional answer and the only one that gets Bangla pages indexed. Rejected by the owner: routing churn across every route and every internal link, for a phase that mostly concerns five pages and the site chrome.
- **`next-intl`.** Its value is the routing layer the owner rejected, and the project's rule is to prefer the platform before adding a dependency. `Intl` already covers Bengali digits and dates.
- **Sub-domain (`bn.example.com`).** Rejected: more infrastructure, same content-duplication problem.
- **A Zustand `localeStore` plus a hydrator, like the currency store.** Rejected: the value is already known on the server at render time, so a second client-side copy would only add a way for the two to disagree.

## Consequences

- **Prerendered HTML is lost.** Reading `cookies()` in the root layout makes every route render per request. `/`, `/products`, and product pages no longer ship static HTML; WordPress data caching is unaffected. Enabling Cache Components and streaming the translated chrome inside `<Suspense>` is the intended remedy.
- **Google sees one language.** The five support pages switch from Bangla to English in the index, because a crawler arrives without a cookie. Bangla remains served to Bangla visitors but is no longer crawlable. If that matters later, it reopens this decision rather than being patched around.
- **No shareable language links.** A URL cannot pin a language, so a shared `/shipping` link renders in the recipient's language.
- **English is both the default and the only indexed language,** which keeps ad landing pages consistent for visitors arriving cold.
- The footer rule in `docs/components.md` ("the support block is Bengali, commerce stays English") no longer describes the site and is replaced by the locale mechanism.

## Related

- [ADR-0001](0001-nextjs-app-router.md)
- [ADR-0002](0002-zustand-and-hydrators.md)
- `docs/architecture.md` — rendering strategy and the browser-side state list.
- `.scratch/bilingual-storefront/spec.md` — the phase-1 scope and decisions.
