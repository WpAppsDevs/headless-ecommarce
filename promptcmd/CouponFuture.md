# Coupon System — Current State & Implementation Plan

## Summary

**The coupon system is UI-only and not integrated with the backend.** There is no API function to apply/remove coupons, no coupon state in the store, and no coupon data passed to checkout. The frontend components are visually wired up but their handlers are empty placeholders. The only real coupon data comes back in order history (`coupon_lines` + `discount_total`), which is purely read-only.

---

## What Exists (UI only)

### CouponSection.tsx — Primary Coupon UI (Cart Page)
- Renders an input + "Apply Code" button
- Renders 3 hardcoded `DEMO_COUPONS` (SAVE10NOW, EXTRA15, BIG20OFF) as clickable cards
- Clicking a card sets the input value to the coupon code
- `handleApply()` currently only `console.log`s — no API call, no store update
- **Visibility:** Controlled by `SETTINGS.showCouponSection` which is currently `false`

### CartDrawer.tsx — Mini-Cart Coupon Panel
- Renders three toggle buttons: Note, Shipping, Coupon
- When `activePanel === 'coupon'`, renders an input + "Apply" button
- **The "Apply" button has no `onClick` handler** — it's a dead button

### CartSummary.tsx — Order Summary (Right Side)
- Has a "Discounts" line that always shows `—` (hardcoded empty state)

---

## What's Missing

### API endpoints (backend)
- No `POST /wpadhlwrapi/v1/cart/apply-coupon`
- No `DELETE /wpadhlwrapi/v1/cart/remove-coupon`

### cart.ts (API module)
- No `apiApplyCoupon(code)` function
- No `apiRemoveCoupon(code)` function
- `CartData` type has no `coupons` or `discount_total` field

### cartStore.ts (Zustand store)
- No `appliedCoupons: Coupon[]` in state
- No `discountTotal: number` in state
- No `applyCoupon(code)` action
- No `removeCoupon(code)` action

### checkout.ts
- `PlaceOrderPayload` has no `coupon_code` or `coupon_lines` field

### orders.ts
- `Order` type is missing `coupon_lines: CouponLine[]` (API returns it but TS type doesn't include it)

### OrderDetailsModal.tsx
- Shows total discount amount but doesn't display which coupon codes were used

---

## Backend Notes

- Uses a custom `wpadhlwrapi/v1` WP REST API namespace (not standard WooCommerce `/wc/v3/coupons`)
- The only real coupon data exists in the orders API response (read-only)

---

## Implementation Plan

1. **Backend:** Add `POST /wpadhlwrapi/v1/cart/apply-coupon` and `DELETE /wpadhlwrapi/v1/cart/remove-coupon` endpoints
2. **cart.ts:** Add `apiApplyCoupon(code)` and `apiRemoveCoupon(code)`, plus `coupons`/`discount_total` fields on `CartData`
3. **cartStore.ts:** Add `appliedCoupons` state + `applyCoupon`/`removeCoupon` actions
4. **CouponSection.tsx:** Replace `console.log` in `handleApply` with store's `applyCoupon()`
5. **CartDrawer.tsx:** Wire the coupon Apply button to store's `applyCoupon()`
6. **CartSummary.tsx:** Replace hardcoded `—` discount with computed discount from store
7. **checkout.ts:** Optionally pass coupon codes in `PlaceOrderPayload`
8. **orders.ts:** Add `coupon_lines: CouponLine[]` to the `Order` TypeScript type
9. **OrderDetailsModal.tsx:** Show which coupon codes were used
