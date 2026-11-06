# Design system

## Stack

- Tailwind CSS 4 through `@tailwindcss/postcss`.
- `@import "tailwindcss"` and `@import "tw-animate-css"` in `src/app/globals.css`.
- shadcn components in the `base-nova` style, built on `@base-ui/react`.
- `lucide-react` icons.
- `sonner` toasts.

There is no `tailwind.config.ts`. Tailwind 4 reads CSS. The design tokens live in `src/app/globals.css`.

## Brand tokens

The `:root` block defines the palette. The `@theme inline` block maps each variable to a Tailwind utility.

| Token | Utility | Typical use |
| --- | --- | --- |
| `--brand-text` | `text-brand-text` | Body and headings |
| `--brand-text-muted` | `text-brand-text-muted` | Secondary copy |
| `--brand-accent` | `bg-brand-accent` | Soft rose accent, surfaces and tints only |
| `--brand-accent-hover` | `bg-brand-accent-hover` | Legacy soft hover; new action hovers use the strong hover |
| `--brand-accent-strong` | `text-brand-accent-strong` | Accent text, icons, links, and filled actions |
| `--brand-accent-strong-hover` | `bg-brand-accent-strong-hover` | Hover for filled strong actions |
| `--brand-accent-light` | `bg-brand-accent-light` | Tints, chips |
| `--brand-bg` | `bg-brand-bg` | Page background |
| `--brand-section` | `bg-brand-section` | Section surfaces |
| `--brand-card` | `bg-brand-card` | Cards |
| `--brand-border` | `border-brand-border` | Hairlines |
| `--brand-stock` | `text-brand-stock` | In-stock / success |
| `--brand-preorder` | `text-brand-preorder` | Pre-order |
| `--brand-wine` | `bg-brand-wine` | Primary action, selected state |
| `--brand-topbar` | `bg-brand-topbar` | Announcement bar |
| `--brand-gold` | `text-brand-gold` | Premium accents on dark surfaces |
| `--brand-gold-strong` | `text-brand-gold-strong` | Stars and small accents on light surfaces |
| `--brand-whatsapp` | `bg-brand-whatsapp` | WhatsApp action |
| `--brand-dark` | `bg-brand-dark` | Dark sections |
| `--brand-dark-surface` | `bg-brand-dark-surface` | Deep dark panels |

The values live in `src/app/globals.css`; that file is the source for exact colors.

The shadcn/base-ui variables (`--background`, `--foreground`, `--primary`, `--border`, `--ring`, and so on) are wired to these brand values. `--primary` and `--ring` use the strong accent with white foreground. A stock Button or Input inherits the palette without per-component edits.

Change a token here, not in components. A raw hex in a component is either a one-off approved design or debt.

### Contrast

WCAG AA is the bar: 4.5:1 for normal text and 3:1 for non-text indicators. The palette keeps two accents on purpose:

- **Strong accent** (`--brand-accent-strong`) for text, icons, links, and filled actions on light surfaces.
- **Soft accent** (`--brand-accent`) for tinted surfaces, and for text and icons on the dark surface. Never put white text on the soft accent; it reaches only 3.15:1.
- The topbar keeps its dusky rose background and uses brand text (`#2B2B2B`) instead of white.
- The WhatsApp action uses the dark WhatsApp token with white text.

Run `npm run check:contrast` after any palette change. It reads the root tokens and fails when a pair drops below its threshold.

## Two visual languages

The storefront mixes two systems. Know which one a screen follows before restyling it.

### 1. Editorial / product-detail

Used by the home page, shop, product detail, cart, checkout, and order pages.

- Playfair Display for headings (`font-serif`) and Inter for small UI text (`font-ui`).
- Maroon `#9E2F45` for selected states and primary product actions.
- Navy `#1F2A3C` for primary text and icons.
- Cream `#FBF7F3` for product surfaces.
- Hairline borders, 8-10px radii, no heavy shadows.
- Lining numerals (`.nums-lining`) on serif prices and headings.

Several product-detail components hardcode these values (`#9E2F45`, `#1F2A3C`, `#E6DED6`) instead of using brand tokens. That is the current implementation. When editing those files, either keep the hardcoded pair or migrate them to tokens in the same change; use one approach per file.

### 2. shadcn / base-nova

Used by auth pages, account pages, and some account modals.

- Geist sans, neutral zinc grays, small radii, standard shadcn spacing.
- `Button`, `Input`, `Label`, `Card`, `Badge`.
- Less editorial, more utilitarian.

The account dashboard and auth pages intentionally look more neutral than the product pages. Keep them separate unless a product decision changes that.

## Typography

Fonts are loaded in `src/app/layout.tsx` through `next/font/google`:

| Variable | Family | Utility |
| --- | --- | --- |
| `--font-geist-sans` | Geist | `font-sans` (global body) |
| `--font-geist-mono` | Geist Mono | `font-mono` |
| `--font-playfair` | Playfair Display | `font-serif` |
| `--font-inter` | Inter | `font-ui` |

`font-serif` is mapped to Playfair with a Georgia fallback. `font-ui` is scoped to the product detail section and similar dense UI; it does not change the global font.

The global sans maps to Geist through `--font-geist-sans`. Do not set `--font-sans` to `var(--font-sans)`; that self-reference resolves to nothing and the browser falls back to Times.

Use `font-serif` for marketing headings and product names. Use the default sans for body and controls. Use `font-ui` only where the approved design uses Inter.

## Layout and spacing

- Max width: `max-w-7xl` for most pages, `max-w-[1200px]` for product detail, `max-w-3xl` for policies and auth.
- Page padding: `px-4 sm:px-6 lg:px-8`.
- Section rhythm: `py-14` to `py-20`.
- Grid: 2 columns on mobile, 3 at `sm`, 4 at `lg` for product grids.
- Header height: 68px. Sticky offsets use `top-24` (96px) to clear it.
- Touch targets: at least 44px for every mobile control, including header icons, pagination, colour swatches, and auth inputs. The visible glyph may be smaller; expand the hit area with padding so layout does not shift.

## Radii, borders, shadows

The product style uses 8-12px radii, 1px borders, and minimal shadows. The shadcn style uses `--radius: 0.625rem` with derived `radius-sm` through `radius-4xl`.

The design uses borders and surface tints for separation. Existing `shadow-sm` and `shadow-md` usages are acceptable; new surfaces use borders and tints.

## Dark mode

There is no `.dark` token block in `globals.css` and no theme toggle. A dormant `@custom-variant dark` and some `dark:` classes remain from shadcn defaults; they activate only under a `.dark` ancestor, which nothing sets. Treat dark mode as unimplemented.

## Motion

- Transitions are short: 150-300 ms.
- Hover lifts and image scales are common.
- The variation selector's mobile sticky bar uses `translate-y` and `inert`.
- Tracking and product accordions use grid-row transitions.
- Respect `prefers-reduced-motion` when adding new animation. The tracking accordion already does; most other components do not.

## Icons

`lucide-react` is the default. Sizes are usually 16-20px in controls and 24-32px in empty states. Stroke width is often 1.5 for decorative icons and 2 for compact actions.

Brand social icons (Facebook, Instagram, WhatsApp, TikTok) are inline SVGs because lucide does not ship brand marks.

## Images

`next/image` is used for product, hero, and local marketing images. `next.config.ts` allows any HTTP or HTTPS host, so remote WordPress images work without a host allowlist.

Local images live under `public/images/`:

```
hero/  categories/  category-grid/  collections/  instagram/  testimonials/
```

The logo is `public/images/Najifa's Shop Logo.png`. The apostrophe and space in the filename are part of the current path.

## Component styling rules

1. Use `cn()` for conditional classes.
2. Use `class-variance-authority` for variants only when a component has three or more variants. Existing `Button` and `Badge` do.
3. Use the existing spacing scale and color tokens for one-offs.
4. Keep focus states visible. The stronger components use `focus-visible:outline-2` with the maroon color.
5. Keep layout decisions in components, not `globals.css`.
6. When a design calls for a token that does not exist, add it to `:root` and `@theme inline` in the same change.

## Changing the theme

**Change a color everywhere.** Edit the `--brand-*` value in `:root`. The shadcn variables follow if they reference the brand token.

After changing a colour, run `npm run check:contrast`. It reads the root tokens and fails when a pair drops below its AA threshold.

**Change a font.** Replace the `next/font` import in `layout.tsx` and the `--font-*` variable. Update `--font-serif` or `--font-ui` in `@theme inline` if the role changes.

**Change the radius.** Edit `--radius`. shadcn's derived radii follow.

**Add a dark theme.** Add the `.dark` token block, a toggle that sets the class on `<html>`, persisted preference, and a contrast audit. Then remove or wire the dormant `dark:` utilities.

## Related

- [components.md](components.md)
- [ADR-0005](adr/0005-brand-token-styling.md)
- `src/app/globals.css`
