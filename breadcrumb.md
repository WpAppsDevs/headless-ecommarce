You are a senior frontend engineer specializing in Next.js (App Router) and headless eCommerce UI architecture.

----------------------------------
CONTEXT:
----------------------------------
- I already have a breadcrumb component implemented on the Cart page
- Design reference is provided: `.design/breadcrumb.png`
- Tech stack:
  - Next.js (App Router)
  - Tailwind CSS
  - Headless WooCommerce

----------------------------------
GOAL:
----------------------------------
Extend and standardize the breadcrumb across multiple pages using the SAME design and structure.

----------------------------------
PAGES TO IMPLEMENT:
----------------------------------
- Product Single Page
- Shop / Archive Page
- Checkout Page

----------------------------------
EXCLUDE:
----------------------------------
- Do NOT show breadcrumb on Home page

----------------------------------
REQUIREMENTS:
----------------------------------

1. REUSE EXISTING COMPONENT
- Do NOT create a new design
- Reuse and refactor the existing breadcrumb component (used in cart page)
- Make it reusable and dynamic

----------------------------------
2. DYNAMIC BREADCRUMB LOGIC
----------------------------------

For each page:

Product Page:
Home / Shop / Category / Product Name

Shop Page:
Home / Shop
(or include category if filtered)

Checkout Page:
Home / Shop / Checkout

----------------------------------
3. DATA SOURCING
----------------------------------
- Product page:
  - Use product category + product name
- Shop page:
  - Use current category or default "Shop"
- Checkout:
  - Static label

----------------------------------
4. COMPONENT DESIGN
----------------------------------
- Match EXACT design from .design/breadcrumb.png
- Include:
  - Separator (e.g. "/")
  - Active state for current page
  - Proper spacing and typography

----------------------------------
5. NEXT.JS IMPLEMENTATION
----------------------------------
- Use App Router
- Support dynamic routes:
  - /product/[slug]
  - /shop
  - /category/[slug]

- Make component reusable:
  <Breadcrumb items={[...]} />

----------------------------------
6. RESPONSIVENESS
----------------------------------
- Mobile friendly
- Handle long product names (truncate if needed)

----------------------------------
7. SEO + ACCESSIBILITY
----------------------------------
- Use semantic HTML:
  <nav aria-label="breadcrumb">
- Use proper link structure

----------------------------------
OUTPUT:
----------------------------------
- Reusable Breadcrumb component
- Example usage for:
  - Product page
  - Shop page
  - Checkout page
- Clean Tailwind styling

----------------------------------
IMPORTANT:
----------------------------------
- Do NOT redesign UI
- Do NOT duplicate logic
- Extend existing implementation cleanly