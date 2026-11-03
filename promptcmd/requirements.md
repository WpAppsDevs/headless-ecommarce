System Design Requirements:

1. Configuration Layer

   * Store API base URL (wrapper API)
   * JWT token handling config
   * Feature toggles (enable/disable modules)
   * Theme settings (colors, layout)

2. API Abstraction Layer

   * Central API client (wrapper API only)
   * Attach JWT token automatically
   * Handle token expiration & refresh
   * Normalize error responses
   * Retry & caching logic

3. Core Modules (Reusable)

   * Product Listing Module (via wrapper API)
   * Product Detail Module
   * Cart Module (fully API-driven)
   * Checkout Module (API order creation)
   * User Account Module (JWT आधारित)

4. Cart System (CRITICAL)

   * Cart must be fully managed via backend API
   * Support guest cart (token-based)
   * Logged-in cart sync with user account
   * Cart persistence via API (not local-only)
   * Handle merge (guest → user login)

5. Authentication System

   * JWT login/register
   * Token storage strategy (httpOnly cookie or secure storage)
   * Auto-login via token
   * Logout & token invalidation

6. Page System (Dynamic)

   * Pages generated dynamically
   * Routing supports dynamic slugs

7. Multi-store Support

   * Switch backend via config
   * Environment-based setup

8. Theming System

   * Component-based UI system
   * Easily customizable styles

9. Pages for E Commerce Site
    * Home page
    * Product archive page
    * Product single page
    * Cart Page
    * checkout page
    * etc

For EACH module include:

* Description
* User Story
* Acceptance Criteria
* API dependency (wrapper endpoints only)
* Edge cases
* Reusability considerations

Technical Requirements:

* SSR / SSG strategy
* Global state management (cart + auth)
* API caching strategy
* Performance optimization

