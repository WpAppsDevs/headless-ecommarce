Redesign the User Account "Orders List" page and "Order Details" page for an eCommerce website using the provided reference designs ONLY for layout, structure, and data presentation.

IMPORTANT:
- Do NOT copy colors from the reference designs
- Use ONLY the provided brand color system (current website colors)
- Reference designs are strictly for layout, spacing, and content structure
- Maintain consistency with the existing website theme

Reference Designs:
- Orders List Page: `.design/orders-list.png`
- Order Details Page: `.design/order details.png`

--------------------------------------------------
🎨 COLOR SYSTEM

Card background: #FFFFFF

Status colors:
- Delivered: #7BAE7F
- Pending: #D89A6A
- Cancelled: #E57373
- Draft: #B39DDB

--------------------------------------------------
🎨 DESIGN RULES

- Follow reference design for layout ONLY
- Apply current brand colors consistently across all UI elements
- Keep a soft, clean, premium look
- Use subtle shadows and rounded corners (12–16px)
- Maintain proper spacing and alignment

--------------------------------------------------
📦 ORDERS LIST PAGE

Implement layout from reference:

Each order card includes:
- Order ID
- Customer info (name, address)
- Amount, items count
- Payment method
- Status badge (use brand status colors)
- Action buttons:
  - View Details (primary accent color)
  - Cancel Order (secondary style)

Design:
- Card-based layout
- Clear hierarchy and spacing
- Consistent button styling using brand colors

--------------------------------------------------
📄 ORDER DETAILS PAGE

Follow reference structure exactly:

Sections:
1. Order summary (ID, date, status)
2. Product list (image, name, vendor, quantity, price)
3. Total amount
4. Shipping address
5. Billing address
6. Timeline (vertical progress steps)
7. Payment summary
8. Action buttons

Design:
- Separate each section with card containers
- Highlight important values (total, status)
- Timeline uses icons + progress state

--------------------------------------------------
🧩 COMPONENT SYSTEM

Use reusable components:
- Order Card
- Status Badge (color from system)
- Button (primary / secondary using accent)
- Section Card
- Timeline Step
- Product Row

All components must use the defined color variables (no hardcoded colors).

--------------------------------------------------
📱 RESPONSIVE

- Mobile-friendly layout
- Stack sections vertically
- Buttons full-width on small devices
- Maintain spacing and readability

--------------------------------------------------
💻 OUTPUT

- High-fidelity UI design
- Consistent with current website color system
- Reference-based layout with improved visual polish
- Ready for development

--------------------------------------------------
❗ STRICT RULES

- Do NOT use reference colors
- Do NOT change layout structure from reference
- Do NOT introduce new sections
- ONLY apply current brand colors to the reference layout