# Localization

The storefront speaks English and Bangla. English is the default; a visitor opts into Bangla with the flag in the header, and the choice is remembered in a cookie.

This page is the durable record. It says what is translated, what is not, why, and which checks stop each rule from rotting. Work notes for the change that built it lived in `.scratch/`, which is local to one machine and not in git — anything here must stay true without them.

## How the language is chosen

- **The `locale` cookie** (`en` or `bn`), one year, `SameSite=Lax`, not httpOnly — the switcher writes it.
- **English when the cookie is absent**, including for a crawler.
- **No locale in the URL.** One URL per page, two languages. The trade-off — the other language is invisible to search — was accepted deliberately; see [ADR-0008](adr/0008-locale-cookie-not-url.md).
- **Read on the server.** `getLocale()` (`src/i18n/server.ts`) reads the cookie, the root layout sets `<html lang>`, and `LocaleProvider` hands the dictionary to client components. Reading the cookie opts every route into per-request rendering; the ADR records that cost and the Cache Components route out of it.

## Where the copy lives

| Surface | Source | Notes |
| --- | --- | --- |
| Chrome: header, footer, announcement, switcher | `src/i18n/{en,bn}.ts` | One map per language, `en` defines the shape |
| Five support pages | `src/app/<route>/content/{En,Bn}.tsx` | Bangla bodies were moved verbatim from the original pages |
| Page metadata | Dictionary, via `generateMetadata` | Title, description and breadcrumb label |
| Form validation | Per-locale zod schemas built by a factory | A Bangla form must not answer in English |
| Taxonomy: category, tag, colour, size | `src/i18n/taxonomy.ts`, keyed by slug | WordPress owns the names; the slug is the identifier |
| Product names, descriptions, brands, review text, courier statuses | WordPress, English only | See "What stays English" |

`Record<Locale, …>` types are used rather than optional keys, so adding a third language turns every call site into a type error instead of silently rendering English.

## What stays English, by decision

- **Product content** — names, descriptions, brand names, review bodies. WordPress has no multilingual fields (no WPML/Polylang; the plugin only exposes `store.locale` from `WPLANG`). The owner declined that work for now. Brand names are proper nouns and would not be translated even with it.
- **Courier status sentences** come from the carrier's API. Translating them would misquote the carrier.
- **Prices keep Western digits in both languages** (`৳ 2,750.00`). Locale-derived Bengali numerals were offered and declined for money.
- **Delivery window is a single constant**: `PRE_ORDER_WINDOW_DAYS` in `src/lib/delivery.ts`, rendered through `formatRange`. 15–25 days, everywhere, in both languages.

## Typography rules

English uses Playfair for headings and Inter for body. Bangla uses one variable family, Noto Sans Bengali, placed after the Latin fonts in each stack so the browser resolves glyph-by-glyph: Latin characters come from Inter or Playfair, Bengali characters fall through to Noto. `next/font` emits `unicode-range`, so an English page never downloads the Bengali file (~105KB).

**Never apply letter-spacing to Bangla.** Bengali is written with joined conjuncts and floating vowel signs; `tracking-[0.3em]` once rendered প্রিমিয়াম as প্রি মি য়াম on the live site. `globals.css` resets `letter-spacing` on every element of a `bn` document, which is why the tracking utilities stay on the components and apply to English only. Details in [design-system.md](design-system.md).

## The checks that hold this together

| Check | Catches |
| --- | --- |
| `npm run check:routes` | Wrong language, wrong `<title>`, wrong delivery window per route and cookie |
| `npm run check:untranslated` | English left in JSX text, or in `aria-label`/`title`/`placeholder`/`alt`, or a `<form>` without `method="post"` |
| `npm test` | `isLocale` rejects junk, formatting follows the locale, taxonomy slugs map, schemas build per language |
| `npm run test:e2e` | The screens behind the login: account tabs, order card and modal, language switch; plus Bangla typography and keyboard entry |
| `npm run check:contrast` | Token pairs, including the Bangla-capable surfaces |

## Adding a new translated string

1. Add the key to `en.ts`, then to `bn.ts` — the `Record<Locale, …>` type fails until both exist.
2. Read it with `useDictionary()` in a client component or `getDictionary(await getLocale())` on the server.
3. Run `npm run verify:full`. `check:untranslated` fails if the English text is still hardcoded in the JSX.

For a new taxonomy term, add its slug to `src/i18n/taxonomy.ts`; an unmapped slug falls back to the name WooCommerce sent, so nothing breaks, but the label stays English.

## Known gaps

- A crawler sees English only.
- The checkout validation screen has a browser test that self-skips while every product is sold out.
- `ProductImages` lightbox declares `role="dialog"` but has no focus trap; `useDialogFocus` is ready for it.
