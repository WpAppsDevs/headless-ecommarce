You are a senior frontend engineer and UI/UX designer.

Your task is to recreate a COMPLETE "My Account" dashboard page for a headless eCommerce website using the provided design references.

IMPORTANT:
- This is NOT a generic design
- You must match the UI layout, structure, and behavior EXACTLY like the reference images
- Pixel-perfect spacing, alignment, and hierarchy is required

Tech Stack:
- Next.js (App Router)
- Tailwind CSS
- TypeScript

Scope:
- Only build the My Account page (inside layout)
- Do NOT include global Header or Footer

Main Layout:
- Two-column layout
  - Left: Sidebar navigation
  - Right: Dynamic content area

----------------------------------
1. Sidebar Navigation (Left)
----------------------------------
Menu Items:
- Dashboard
- Your Orders
- My Address
- Setting
- Logout

Requirements:
- Active menu highlight
- Icons for each menu item
- Rounded container with soft border
- Sticky sidebar on desktop
- Clicking menu switches content (tab-based UI or routing)

Design sample: `.design/dashboard.png`

----------------------------------
2. Dashboard Tab
----------------------------------
Top Section:
- Page title: "My Account"
- Subtitle description text

Stats Cards:
- Awaiting Pickup
- Cancelled Orders
- Total Orders

Recent Orders Table:
- Columns:
  - Order ID
  - Price
  - Status (badge: Pending / Delivery / Completed / Canceled)
  - Order date

Design:
- Card-based layout
- Clean table UI with spacing
- Status badges with colors

Design sample: `.design/dashboard.png`

----------------------------------
3. Orders Tab (Your Orders)
----------------------------------
- Tabs:
  - All Orders
  - Pending
  - Delivery
  - Completed
  - Canceled

Each Order Card:
- Order Number
- Order Status badge (top-right)

Buttons:
- Order Details
- Cancel Order (if applicable)

Design:
- Card layout with spacing between orders
- Soft border + rounded corners

Order Details Button Action:
- when user click Order details button it's open a modal
- display full order details

Order Tab Design sample: `.design/orders.png`
Order details modal design sample: `.design/order-details-popup.png`

----------------------------------
4. My Address Tab
----------------------------------
- Two section:
  - Billing Address
  - Shipping Address

Each section:
- woocommarce billing / shipping fields
- Edit button

----------------------------------
5. Settings Tab
----------------------------------
Form Fields:
- First Name
- Last Name
- Email
- Password Change:
  - Current Password
  - New Password
  - Confirm Password

Requirements:
- Clean form UI
- Proper spacing
- Save Changes button

Design sample: `.design/settings.png`

----------------------------------
6. Logout
----------------------------------
- When click logout button call logout functionality

----------------------------------
Design Requirements:
- EXACT layout like reference images
- Clean minimal eCommerce UI
- Consistent spacing system
- Soft shadows and rounded corners
- Tailwind CSS only
- Fully responsive

----------------------------------
Functional Requirements:
- Tab switching (state or route-based)
- Reusable components
- Accept API data as props (DO NOT hardcode logic)

----------------------------------
Component Structure:
- AccountLayout.tsx
- Sidebar.tsx
- Dashboard.tsx
- Orders.tsx
- Address.tsx
- Settings.tsx
- OrderCard.tsx
- StatsCard.tsx

----------------------------------
Data Structure:
user = {
  firstName,
  lastName,
  email
}

orders = [{
  id,
  status,
  items: [{
    name,
    image,
    price,
    variant
  }]
}]

----------------------------------
Output:
- Full Next.js components
- Clean architecture
- Ready to integrate with WooCommerce API
- Update the `Code Documentation.md` file

IMPORTANT:
Do NOT redesign or change layout.
Strictly follow the provided UI structure and visual style.