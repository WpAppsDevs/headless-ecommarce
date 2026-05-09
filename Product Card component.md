Redesign the current WooCommerce product card component to match the exact layout and visual style of the provided reference image.

IMPORTANT:
Use the attached reference image as the primary design source and recreate the same UI structure, spacing, hierarchy, proportions, and styling as closely as possible.

Reference Design:
`.design/Product Card.png`

Design Goals:
- Modern premium Pakistani fashion ecommerce aesthetic
- Soft luxury color palette (cream, blush, maroon, beige)
- Clean elegant layout
- Rounded corners
- Soft shadows
- Large product image area
- Minimal but premium typography
- Mobile responsive

Card Structure:
- Product image at top
- Wishlist icon at top-right
- "NEW" badge at top-left
- Product title
- Short subtitle/category text
- Star rating with review count
- Price
- Quantity selector
- Add to Cart button

Behavior Requirements:
1. Use ONE unified card design for both:
   - Simple Products
   - Variable Products

2. For Simple Products:
   - Hide variation-related UI
   - Do NOT show:
     - color swatches
     - size options
     - variation selectors

3. For Variable Products:
   - Show variation options inside the card
   - Display:
     - color swatches
     - size buttons
     - selected variation state
   - Keep layout clean and compact

4. Maintain consistent card height and alignment.

5. Improve hover interactions:
   - slight image zoom
   - soft shadow elevation
   - smooth transitions

6. Keep spacing and typography visually identical to the reference image.

Technical Requirements:
- WooCommerce compatible
- Preserve dynamic product functionality
- Support AJAX add to cart
- Fully responsive
- Clean semantic HTML structure
- Modern CSS architecture
- Do not use bulky styling
- Optimize for performance

IMPORTANT:
Do not create a completely new design concept.
Closely replicate the attached reference design and adapt it into a real WooCommerce product card component.
