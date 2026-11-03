I already have an existing Next.js headless WooCommerce ecommerce website connected to a custom WordPress headless API plugin.

I do NOT want to rebuild the frontend architecture from scratch.

Your task is to ADD a scalable Wishlist / Favorite Products feature into the EXISTING Next.js codebase while following the current project architecture, patterns, and coding style.

API Documentation: `API Documentation.md`

Current Stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Headless WooCommerce API
- JWT Authentication
- Existing API service layer
- Existing auth system
- Existing state management
- Existing product card/grid components

Requirements:

1. Analyze and extend the EXISTING frontend architecture only.
Do NOT recreate the app structure.

2. Integrate Wishlist functionality into:
- existing product cards
- product details page
- header wishlist count
- mobile menu if available

3. Use these existing backend APIs:

GET    /wp-json/headless/v1/wishlist
POST   /wp-json/headless/v1/wishlist
DELETE /wp-json/headless/v1/wishlist/{product_id}
GET    /wp-json/headless/v1/wishlist/check/{product_id}

4. Implement:
- Add to wishlist
- Remove from wishlist
- Toggle wishlist state
- Wishlist page
- Wishlist counter
- Loading states
- Optimistic UI updates
- Error handling
- Toast notifications

5. Guest User Support:
- Store guest wishlist in localStorage
- Sync guest wishlist after login
- Merge duplicates properly

6. Follow the EXISTING project patterns:
- API service architecture
- hooks structure
- component structure
- auth flow
- state management approach
- UI component conventions
- TypeScript conventions

7. Performance:
- Avoid unnecessary re-renders
- Cache wishlist state efficiently
- Use optimistic updates
- Minimize API requests

8. UI Requirements:
- Heart icon toggle
- Filled state when active
- Smooth transition animation
- Mobile responsive
- Accessible button interactions

9. Generate:
- ONLY the new files and modified existing files
- Full actual implementation code
- Exact placement instructions for each update

10. Also integrate:
- Wishlist page route
- Empty wishlist state
- Remove item functionality
- Header wishlist badge count

11. Important:
Do NOT rebuild the frontend architecture.
Do NOT create duplicate patterns.
Extend the current codebase cleanly using the EXISTING architecture and coding style.