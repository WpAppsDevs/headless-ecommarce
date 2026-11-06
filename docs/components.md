# Components

Component conventions live in [coding-standards.md](coding-standards.md). This file is the inventory: what exists, what it does, and how the pieces compose.

## Layout

| Component | Type | Responsibility |
| --- | --- | --- |
| `layout/Header.tsx` | Client | Sticky header, logo, desktop/mobile nav, search overlay, account menu, wishlist badge, cart button, mobile sheet. |
| `layout/Footer.tsx` | Server | Brand block, help links, newsletter form, payment badges. |
| `layout/FooterNewsletterForm.tsx` | Client | Posts to `/api/newsletter`. |
| `layout/AuthHydrator.tsx` | Client | Calls `authStore.hydrate()` once. |
| `layout/CartHydrator.tsx` | Client | Fetches the cart once, after auth hydration, only if there is something to restore. |
| `layout/WishlistHydrator.tsx` | Client | Hydrates guest or server wishlist once. |
| `layout/CurrencyHydrator.tsx` | Client | Fetches store settings once. |
| `layout/ErrorReporter.tsx` | Client | Reports uncaught window errors and unhandled rejections. |

`Header` takes `navLinks?: NavLink[]`. Empty or missing links fall back to `STATIC_NAV_LINKS`, which includes `/contact`; that static support page exists.

The mobile menu uses the shadcn `Sheet` primitive. The search overlay is a local component with autofocus and Escape-to-close.

## Home

| Component | Type | Notes |
| --- | --- | --- |
| `HeroSlider.tsx` | Server | Despite the name, it does not slide. Static hero with a desktop image and a mobile stacked image. |
| `AnnouncementBar.tsx` | Server | Top strip with shipping copy and social links. |
| `CategoryBanners.tsx` | Server | Three category image cards linking to `/products?category=…`. |
| `CategoryGrid.tsx` | Server | Ready stock, pre-order, and catalog entry cards. |
| `PreOrderSteps.tsx` | Server | Four-step explainer. |
| `WholesaleBanner.tsx` | Server | Wholesale value proposition and stats. |
| `TestimonialsSection.tsx` | Client | Fetches random reviews; falls back gracefully. |
| `ComingSoonSection.tsx` | Client | Newsletter capture for a future collection. |
| `FeaturesStrip.tsx` | Server | Four trust points. |
| `WhatsAppCTA.tsx` | Server | WhatsApp link block. |

## Shop

| Component | Type | Responsibility |
| --- | --- | --- |
| `ShopClient.tsx` | Client | Owns sort, price, color, size, grid, mobile filter drawer, and pagination links. |
| `ShopSidebar.tsx` | Client | Category/tag/brand links plus price, color, and size controls. |
| `ShopTopBar.tsx` | Client | Result count, sort select, grid density, mobile filter button. |

`ShopClient` receives server-rendered products and filters. It does not refetch when filters change; it filters the current page in memory. Server-side filters (category, tag, brand, search) are links, so changing one navigates and reloads the page.

## Product

| Component | Type | Responsibility |
| --- | --- | --- |
| `ProductCard.tsx` | Client | Image hover swap, availability badge, price, quantity, add-to-cart or select-options, wishlist heart. |
| `AvailabilityBadge.tsx` | Shared | Pre-Order or Sold Out badge shared by cards and the product detail. |
| `ProductCardSkeleton.tsx` | Server | Loading placeholder. |
| `ProductGrid.tsx` | Server | Simple grid wrapper. |
| `ProductImages.tsx` | Client | Gallery, thumbnails, lightbox. |
| `VariationSelector.tsx` | Client | Price, availability badge, attribute controls, quantity, add-to-cart or sold-out state, mobile sticky bar. |
| `ProductTabs.tsx` | Client | Accordion for details, additional info, shipping, reviews. |
| `RelatedProducts.tsx` | Server | Fetches four products; renders nothing on failure. |
| `SearchBar.tsx` | Client | Legacy search input. The header has its own overlay. |

`ProductCard` sends `variationId = 0` for simple products. A variable product shows "Select Options" and links to the detail page instead of adding directly. Its quantity selector is local to the card.

Availability comes from the shared product-availability module. A pre-order product shows Pre-Order, a sold-out product shows Sold Out, and the NEW badge is not used. A sold-out card hides the quantity and add controls and offers a View Product link instead.

## Cart

| Component | Type | Responsibility |
| --- | --- | --- |
| `CartDrawer.tsx` | Client | Right sheet, item list, shipping note, subtotal, checkout links. |
| `CartPageContent.tsx` | Client | Renders table and summary, retrying the cart fetch only when needed. |
| `CartItem.tsx` | Client | Drawer row with quantity stepper and remove. |
| `CartItemRow.tsx` | Client | Page table row. |
| `CartSummary.tsx` | Client | Store shipping methods, estimated total, checkout button. |

The drawer and the cart page are separate implementations with different markup. Change both when changing cart behavior or copy.

## Checkout

| Component | Type | Responsibility |
| --- | --- | --- |
| `CheckoutForm.tsx` | Client | Validation, address fields, country/state selects, shipping, gateway, submission. |
| `StripeForm.tsx` | Client | Loads Stripe.js, renders `CardElement`, exposes `getPaymentMethodId()` through a ref. |
| `BacsInfo.tsx` | Server | Bank-transfer explanation. |

`StripeForm` is dynamically imported with `ssr: false` inside `CheckoutForm`. The public component wraps the inner element in `<Elements>`. The ref is the only API: `getPaymentMethodId()` returns an ID or `null` and shows card errors inline.

`CheckoutForm` is the largest file in the repository. It mixes schema, error mapping, layout, and submission. When changing it, keep the zod schema and the API payload in sync; the `onError` handler builds a "Missing: …" message from a separate label map.

## Account

| Component | Type | Responsibility |
| --- | --- | --- |
| `AccountLayout.tsx` | Client | Tab shell, mobile tab bar, logout. Reads `?tab=` once. |
| `Dashboard.tsx` | Client | Stats and recent orders. |
| `StatsCard.tsx` | Client | Label, value, icon. |
| `Orders.tsx` | Client | Filter tabs, five per page, details modal. |
| `OrderCard.tsx` | Client | Order summary, status, and review action. |
| `OrderDetailsModal.tsx` | Client | Products, addresses, and a seven-step status timeline. |
| `Address.tsx` | Client | Read-only billing and shipping cards. |
| `Settings.tsx` | Client | Read-only account summary with support channels. |
| `Wishlist.tsx` | Client | Server wishlist grid with remove. |

Review eligibility lives in `OrderCard`: paid status (`completed` or `processing`), not fully refunded, and not already reviewed in this session.

## Reviews

| Component | Type | Responsibility |
| --- | --- | --- |
| `ProductReviewsSection.tsx` | Client | Entry point: aggregate, write CTA, list, modal. |
| `RatingSummary.tsx` | Client | Average and distribution bars. |
| `ReviewList.tsx` | Client | Pagination, sort, loading, error. |
| `ReviewCard.tsx` | Client | Author, stars, text, media, lightbox. |
| `ReviewFilters.tsx` | Client | Newest / most helpful select. |
| `ReviewForm.tsx` | Client | Rating, title, content, image upload, submit. |
| `ReviewImageUpload.tsx` | Client | Drag/drop, validation, thumbnails. |
| `StarRatingInput.tsx` | Client | Accessible radio group with labels. |
| `ReviewListSkeleton.tsx` | Client | Loading rows. |
| `ReviewsErrorBoundary.tsx` | Client | Isolates review failures from the product page. |

`ProductReviewsSection` receives an optional `initialAggregate` from the server. It bumps the total locally after a submission; the list refetches on its own.

## Tracking

| Component | Type | Responsibility |
| --- | --- | --- |
| `TrackingForm.tsx` | Client | Email and order ID fields; validation differs for guests and users. |
| `TrackingAccordion.tsx` | Client | Order header, status pill, details, timeline. |
| `TrackingTimeline.tsx` | Server | Timeline wrapper, optional embedded mode. |
| `TrackingStatus.tsx` | Server | One timeline row. |

## Wishlist and policies

| Component | Type | Responsibility |
| --- | --- | --- |
| `WishlistButton.tsx` | Client | Heart toggle in `card` or `detail` variant. |
| `PolicyUI.tsx` | Server | `SectionHeading`, `Card`, `StatCard`, `BulletList`, `NoteCallout`, `TypePanel`. |

## UI primitives

`src/components/ui/` contains shadcn/base-nova components:

`button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `sheet.tsx`, `skeleton.tsx`, and the app-specific `PageHeader.tsx`.

`PageHeader` is not a shadcn primitive. It renders the gradient title band and breadcrumb trail used on interior pages. It also contains a hardcoded paragraph for the `My Account` title.

The project uses `@base-ui/react` through shadcn's `base-nova` style. `class-variance-authority`, `clsx`, and `tailwind-merge` back the variant helpers.

## Composition patterns

**Server page, client island.** The page fetches data and renders a client component with initial props. See `/products` and `ProductTabs`.

**Client shell, server section.** `CartPageContent` is client; `PageHeader` is server. Both can render in the same page.

**Error boundary around a risky section.** Reviews are wrapped in `ReviewsErrorBoundary` so a review failure does not take down the product page.

## Accessibility notes

The codebase is mixed. Follow the stronger patterns already present:

- Accordions use a real `<button>` with `aria-expanded` and `aria-controls`; panels have `id`, `role="region"`, and `aria-labelledby`.
- The tracking accordion and variation selector use `inert` when their panels are closed or offscreen.
- Color/size swatches use `aria-pressed`, labels, and visible focus styles.
- The star rating input is a `radiogroup` with radio buttons and descriptive labels.
- Product and wishlist buttons have `aria-label`; icon-only buttons in the header do too.

Known weak spots: the image carousel dots rely on hover for visibility, and some modal focus trapping is incomplete. Improve these when touching the component.

## Adding a component

1. Decide server or client.
2. Put it in the domain folder, or `ui/` if it has no domain meaning.
3. Pass data in as props; fetch once and share the result.
4. If it needs the cart, wishlist, auth, or currency, read the store directly.
5. If it needs a new endpoint, add the API function first.
6. Use brand tokens, not raw hex values, unless you are matching a one-off approved design.

Done when the component renders its empty, loading, and error states and the change passes the definition of done.
