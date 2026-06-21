You are a senior Next.js and Headless Commerce frontend architect.

I have a custom WooCommerce Headless API.

I want to build a professional Order Tracking page similar to Amazon, Daraz, Shopify, and AliExpress.

Requirements
------------

Create:

Route:

/track-order

Features
--------

1. Search Form

Fields:

- Order Number
- Email Address

Button:

Track Order

2. Call API

API Documentation: "ApiDocs.md"

3. Handle States

- Loading
- Success
- Error
- Empty

4. Tracking Result Card

Show:

- Order ID
- Order Date
- Order Status
- Order Total

5. Tracking Timeline

Display:

✓ Order Placed
✓ Payment Received
✓ Processing
✓ Packed
✓ Shipped
✓ Out For Delivery
✓ Delivered

Use a modern timeline UI.

6. Shipping Information

If available:

- Carrier Name
- Tracking Number
- Tracking URL
- Estimated Delivery Date

7. Responsive Design

Support:

- Desktop
- Tablet
- Mobile

8. SEO

Generate metadata.

9. Component Structure

Create:

components/tracking/

TrackingForm.tsx
TrackingTimeline.tsx
TrackingCard.tsx
TrackingStatus.tsx

10. Data Layer

Use:

- Fetch API or Axios
- React Query (preferred)

11. Error Handling

Show user-friendly messages.

12. Compatibility

The UI must automatically support providers:
- Steadfast

without major code changes.

13. Generate:

- Page
- Components
- Typescript Types
- API Client
- React Query Hooks
- Responsive UI

Use App Router (Next.js 15+).

Use TypeScript.

Follow modern best practices.

Before coding, explain the architecture and implementation plan.

IMPORTANT: EXISTING SYSTEM ANALYSIS REQUIRED

Before writing any code:

1. Analyze the existing codebase.
2. Analyze the existing project architecture.
3. Analyze all provided documentation.
4. Analyze existing folder structures.
5. Analyze existing coding patterns.
6. Analyze existing APIs and services.
7. Analyze existing helper functions and reusable components.

You MUST reuse existing code whenever possible.

Do NOT:
- Create duplicate services
- Create duplicate helper functions
- Create duplicate API clients
- Create duplicate business logic
- Introduce a new architecture that conflicts with the current system

Always extend the existing implementation before creating new code.

If an existing solution already exists:
- Reuse it
- Improve it if necessary
- Explain why

Only create new code when no suitable implementation already exists.