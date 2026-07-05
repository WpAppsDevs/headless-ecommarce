# New API Endpoints — Implementation Plan

**For:** WordPress API plugin developer
**Plugin namespace:** `wpadhlwrapi/v1` (products, cart, filters, store, countries) and `api` (auth, checkout, orders, user)
**Date:** 2026-07-04

---

## Endpoint 1 — Country & State List (NEW)

```
GET /wp-json/wpadhlwrapi/v1/countries
```

- **Authentication:** None (public endpoint)
- **Method:** GET only
- **Frontend usage:** `getCountries()` in `src/lib/api/checkout.ts` — populates country `<select>` and state `<select>/<input>` on checkout page

### Backend Implementation

```php
// Register route (routes/countries.php or similar)
register_rest_route( 'wpadhlwrapi/v1', '/countries', [
    'methods'  => 'GET',
    'callback' => 'wpadhlwrapi_get_countries',
    'permission_callback' => '__return_true',
] );

function wpadhlwrapi_get_countries( WP_REST_Request $request ) {
    $countries = new WC_Countries();
    $allowed   = $countries->get_allowed_countries(); // or get_countries() if all needed
    $data      = [];

    foreach ( $allowed as $code => $name ) {
        $states = $countries->get_states( $code ); // returns array or false
        $data[] = [
            'code'   => $code,
            'name'   => $name,
            'states' => array_map(
                fn( $state_code, $state_name ) => [
                    'code' => $state_code,
                    'name' => $state_name,
                ],
                array_keys( $states ?: [] ),
                array_values( $states ?: [] )
            ),
        ];
    }

    return rest_ensure_response( [ 'success' => true, 'data' => $data ] );
}
```

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "code": "BD",
      "name": "Bangladesh",
      "states": [
        { "code": "BD-13", "name": "Dhaka" },
        { "code": "BD-55", "name": "Rangpur" }
      ]
    },
    {
      "code": "US",
      "name": "United States",
      "states": [
        { "code": "AL", "name": "Alabama" },
        { "code": "NY", "name": "New York" },
        { "code": "CA", "name": "California" }
      ]
    },
    {
      "code": "GB",
      "name": "United Kingdom",
      "states": []
    }
  ]
}
```

### Frontend TypeScript Type

```typescript
// Already in src/lib/api/checkout.ts
export interface Country {
  code: string;
  name: string;
  states: Array<{ code: string; name: string }>;
}
```

---

## Endpoint 2 — Update Cart Response: Add Shipping Methods

**Priority:** High — the frontend checkout page expects `shipping_methods` in the cart response. Without this, shipping radio buttons won't populate.

### Current `GET /wpadhlwrapi/v1/cart` Response

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "cart_token": "uuid-abc-123"
  }
}
```

### Required Update — Add These Fields to the Response

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "cart_token": "uuid-abc-123",
    "shipping_methods": [
      { "id": "free_shipping", "label": "Free Shipping", "cost": "0.00" },
      { "id": "flat_rate",     "label": "Flat Rate — Standard shipping", "cost": "35.00" }
    ],
    "chosen_shipping_method": "free_shipping",
    "discount_total": "0.00",
    "coupons": []
  }
}
```

### Backend Implementation

```php
// Inside the existing cart GET callback
$cart         = // ... load from wp_hl_cart
$shipping_rates = []; // Get from WC()->session or calculate on the fly

// Collect available shipping methods for the cart contents
$package = WC()->shipping->calculate_shipping( WC()->cart->get_shipping_packages() );
$rates   = WC()->session->get( 'shipping_for_package_0' )['rates'] ?? [];

foreach ( $rates as $rate_id => $rate ) {
    $shipping_rates[] = [
        'id'    => $rate_id,
        'label' => $rate->get_label(),
        'cost'  => $rate->get_cost(),
    ];
}

return rest_ensure_response( [
    'success' => true,
    'data'    => [
        'items'                  => $cart->items,
        'cart_token'             => $cart->cart_token,
        'shipping_methods'       => $shipping_rates,
        'chosen_shipping_method' => $cart->shipping_method ?? ( $shipping_rates[0]['id'] ?? '' ),
        'discount_total'         => $cart->discount_total ?? '0.00',
        'coupons'                => $cart->coupons ?? [],
    ],
] );
```

### Field Reference

| Field | Type | Notes |
|---|---|---|
| `shipping_methods` | array | All available shipping rates for current cart contents |
| `shipping_methods[].id` | string | Method ID (e.g. `"free_shipping"`, `"flat_rate:1"`) |
| `shipping_methods[].label` | string | Human-readable name |
| `shipping_methods[].cost` | string | Formatted decimal string (e.g. `"0.00"`, `"35.00"`) |
| `chosen_shipping_method` | string | Currently selected method ID (empty string if none) |
| `discount_total` | string | Total discount from applied coupons |
| `coupons` | array | Applied coupon codes + per-coupon discount amounts |

### Frontend TypeScript Type

```typescript
// Already in src/lib/api/cart.ts & src/stores/cartStore.ts
export interface CartData {
  items: CartItem[];
  cart_token: string | null;
  guest_token?: string;
  shipping_methods?: Array<{
    id: string;
    label: string;
    cost: string;
    description?: string;
  }>;
  chosen_shipping_method?: string;
}
```

---

## Endpoint 3 — Apply Coupon (NEW)

```
POST /wp-json/wpadhlwrapi/v1/cart/apply-coupon
```

- **Authentication:** None (uses cart token from cart_token header or guest_token)
- **Method:** POST
- **Content-Type:** application/json

### Request Body

```json
{
  "coupon_code": "SAVE10"
}
```

### Backend Implementation

```php
// routes/cart.php
register_rest_route( 'wpadhlwrapi/v1', '/cart/apply-coupon', [
    'methods'             => 'POST',
    'callback'            => 'wpadhlwrapi_apply_coupon',
    'permission_callback' => '__return_true',
    'args'                => [
        'coupon_code' => [
            'required'          => true,
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ],
    ],
] );

function wpadhlwrapi_apply_coupon( WP_REST_Request $request ) {
    $code  = $request->get_param( 'coupon_code' );
    $cart  = // get cart from service (guest or user)

    // Validate coupon
    $coupon = new WC_Coupon( $code );
    $valid  = $coupon->is_valid();

    if ( is_wp_error( $valid ) ) {
        return new WP_Error(
            $valid->get_error_code(),
            $valid->get_error_message(),
            [ 'status' => 400 ]
        );
    }

    // Store coupon on cart record
    $cart->add_coupon( $code );
    $cart->recalculate_totals();

    return rest_ensure_response( [
        'success' => true,
        'data'    => $cart->to_array(), // includes items, discount_total, coupons
    ] );
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "cart_token": "uuid-abc-123",
    "discount_total": "5.00",
    "coupons": [
      { "code": "SAVE10", "discount": "5.00", "discount_tax": "0.00" }
    ],
    "shipping_methods": [ ... ]
  }
}
```

### Error Responses

| Code | HTTP Status | Message |
|---|---|---|
| `invalid_coupon` | 400 | Coupon does not exist or has expired. |
| `coupon_min_spend` | 400 | The minimum spend for this coupon has not been met. |
| `coupon_already_applied` | 400 | This coupon has already been applied. |
| `coupon_usage_limit` | 400 | Coupon usage limit has been reached. |
| `coupon_expired` | 400 | This coupon has expired. |

---

## Endpoint 4 — Remove Coupon (NEW)

```
DELETE /wp-json/wpadhlwrapi/v1/cart/remove-coupon
```

- **Authentication:** None
- **Method:** DELETE

### Request Body

```json
{
  "coupon_code": "SAVE10"
}
```

### Success Response

Same shape as apply-coupon — returns updated cart with `discount_total` and `coupons` reflecting removal.

### Backend Implementation

```php
register_rest_route( 'wpadhlwrapi/v1', '/cart/remove-coupon', [
    'methods'             => 'DELETE',
    'callback'            => 'wpadhlwrapi_remove_coupon',
    'permission_callback' => '__return_true',
    'args'                => [
        'coupon_code' => [
            'required'          => true,
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ],
    ],
] );
```

---

## Endpoint 5 — Update Checkout: Accept Shipping Method

**Existing endpoint:** `POST /wp-json/api/checkout`

The frontend already sends these fields. The backend needs to accept and apply them:

### Additional Request Fields

```json
{
  "gateway": "stripe",
  "payment_data": { "payment_method_id": "pm_xxx" },
  "billing": { ... },
  "shipping": { ... },
  "shipping_method": "flat_rate",
  "shipping_cost": "35.00"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `shipping_method` | string | Yes | The shipping method ID selected by customer |
| `shipping_cost` | string | No | The cost of the selected shipping method (informational; recalculate server-side) |

### Backend Implementation

```php
// Inside the existing place-order callback
$shipping_method = $request->get_param( 'shipping_method' );

// Set shipping method on the WooCommerce order
$order->set_shipping_method( $shipping_method );
// OR: add shipping as a line item
$item = new WC_Order_Item_Shipping();
$item->set_method_id( $shipping_method );
$order->add_item( $item );
```

---

## Complete Summary

| # | Method | Endpoint | Priority | Status |
|---|---|---|---|---|
| 1 | GET | `/wpadhlwrapi/v1/countries` | **High** | New — country/state dropdowns already coded in frontend |
| 2 | UPDATE | `GET /wpadhlwrapi/v1/cart` | **High** | Add `shipping_methods`, `chosen_shipping_method`, `discount_total`, `coupons` to response |
| 3 | POST | `/wpadhlwrapi/v1/cart/apply-coupon` | Medium | New — coupon system (Future) |
| 4 | DELETE | `/wpadhlwrapi/v1/cart/remove-coupon` | Medium | New — coupon system (Future) |
| 5 | UPDATE | `POST /api/checkout` | **High** | Accept `shipping_method` and `shipping_cost` in payload |
