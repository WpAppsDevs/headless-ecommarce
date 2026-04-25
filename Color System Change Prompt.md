Redesign the entire website UI color system for a Pakistani fashion eCommerce brand using a soft dusty rose premium palette inspired by the provided reference design.

IMPORTANT:
- Do NOT change layout or structure
- Only update the color system
- Implement a centralized global color system (design tokens / variables)

--------------------------------------------------
🎨 COLOR PALETTE (USE EXACT VALUES)

Primary text: #2B2B2B
Secondary text: #6F6F6F

Primary accent (buttons, highlights): #C97C7C
Accent hover state: #B46666
Light accent background: #F3E4E4

Main background: #F8F5F2
Section background: #FFFFFF
Card background: #FBF7F5

Borders and dividers: #E8E2DD

Optional status colors:
- Ready Stock: #7BAE7F
- Pre-Order: #D89A6A

--------------------------------------------------
🧩 GLOBAL COLOR SYSTEM (VERY IMPORTANT)

Define all colors as reusable global variables / design tokens.

Example structure:

- --color-primary-text
- --color-secondary-text
- --color-accent
- --color-accent-hover
- --color-bg-main
- --color-bg-section
- --color-bg-card
- --color-border
- --color-success (stock)
- --color-warning (pre-order)

Requirements:
- All UI elements must use these variables (no hardcoded colors)
- Ensure consistency across all components
- Make the system easily maintainable and scalable

--------------------------------------------------
📍 APPLY COLORS TO

- Hero section
- Navigation bar
- Buttons (primary, secondary, outline)
- Product cards
- Badges (Ready Stock, Pre-Order, Catalog)
- Sections and backgrounds
- Footer

--------------------------------------------------
🎯 UX RULES

- CTA buttons must stand out using accent color
- Use accent color sparingly (10–20%)
- Maintain strong contrast and readability
- Ensure mobile accessibility

--------------------------------------------------
💻 IMPLEMENTATION OUTPUT

Provide:
1. Updated UI with new colors applied
2. Global color variable system (CSS variables or design tokens)
3. Example usage in components (buttons, cards, etc.)

Example (CSS variables):

:root {
  --color-primary-text: #2B2B2B;
  --color-accent: #C97C7C;
  --color-bg-main: #F8F5F2;
}

--------------------------------------------------
🚀 GOAL

- Premium, elegant, feminine UI
- Fully scalable color system
- Easy future updates (change in one place reflects everywhere)

Also generate Tailwind config or CSS variable integration so colors can be updated globally from a single file.