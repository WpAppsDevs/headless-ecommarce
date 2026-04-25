You are a senior frontend engineer and UI/UX designer.

Your task is to REDESIGN an existing Shopping checkout page for a headless eCommerce website.

IMPORTANT:
- I already have a working checkout system (logic, API, state management)
- You must NOT change business logic
- ONLY redesign the UI layer to match the new design reference EXACTLY

----------------------------------
GOAL
----------------------------------
Transform the EXISTING checkout page UI into the NEW DESIGN (pixel-perfect match).

----------------------------------
LAYOUT STRUCTURE
----------------------------------
Main layout:
- Two-column layout
  - Left: Cart items
  - Right: Order summary (sticky)

----------------------------------
1. TOP SECTION
----------------------------------
- Page title: "Shopping Cart"
- Breadcrumb: Homepage / Shop / Shopping Cart
- Notification banner:
  - "Your cart will expire in X minutes"
  - There will be a setting for this. You can do that from the settings whether it will be shown or not.
- Free shipping progress bar:
  - "Buy $X more to get free shipping"
  - Progress indicator with green bar
  - There will be a setting for this. You can do that from the settings whether it will be shown or not.

----------------------------------
2. CART ITEMS TABLE (LEFT SIDE)
----------------------------------
Columns:
- Product (image + name + variant)
- Price
- Quantity (with +/- buttons)
- Total price
- Remove button (icon)

Each item includes:
- Product image (rounded)
- Product name
- Variant selectors (color, size dropdown)
- Quantity stepper
- Remove icon (right aligned)

----------------------------------
3. COUPON SECTION
----------------------------------
- Input field: "Add voucher discount"
- Apply button
- Predefined coupon cards:
  - Show discount (e.g., 10% OFF)
  - Coupon code
  - Apply button
- There will be a setting for this. You can do that from the settings whether it will be shown or not.

----------------------------------
4. ORDER SUMMARY (RIGHT SIDE)
----------------------------------
Card-style container:
- Subtotal
- Discounts
- Shipping options:
  - Free Shipping
  - Local
  - Flat Rate
- Total price

- Terms & Conditions checkbox

- CTA Button:
  - "Proceed To Checkout" (primary)

- "Continue Shopping" link

----------------------------------
5. RECOMMENDED PRODUCTS
----------------------------------
Section title: "You May Also Like"

- Product grid (4 columns desktop)
- Each product card:
  - Image
  - Name
  - Price
  - Discount badge
  - Color swatches
  - Add to cart button (on hover)

----------------------------------
DESIGN REQUIREMENTS
----------------------------------
- EXACT visual match with reference design
- Clean, modern eCommerce UI
- Proper spacing, typography, alignment
- Soft shadows, rounded corners
- Tailwind CSS only
- Fully responsive

----------------------------------
TECH STACK
----------------------------------
- Next.js (App Router)
- Tailwind CSS
- TypeScript

----------------------------------
INTEGRATION REQUIREMENTS
----------------------------------
- Use existing cart data (props or global state)
- Do NOT hardcode business logic
- Keep API integration untouched

----------------------------------
COMPONENT STRUCTURE
----------------------------------
- CartPage.tsx
- CartItemRow.tsx
- CartSummary.tsx
- CouponSection.tsx
- FreeShippingBar.tsx
- RecommendedProducts.tsx

----------------------------------
FUNCTIONAL REQUIREMENTS
----------------------------------
- Quantity update UI (connected to existing handler)
- Remove item UI trigger
- Coupon apply UI trigger
- Shipping option selection UI

----------------------------------
OUTPUT
----------------------------------
- Clean reusable components
- Pixel-perfect UI
- Ready to plug into existing headless WooCommerce system

----------------------------------
CRITICAL:
----------------------------------
Do NOT redesign.
Do NOT simplify.
Do NOT change layout.

Strictly replicate the provided design.

Design Image: `.design/ShoppingCart.png`