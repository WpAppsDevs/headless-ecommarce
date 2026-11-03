# Store Settings API — Endpoint Specification

**For:** WordPress API plugin developer
**Namespace:** `api` (same as wishlist, auth, orders)
**Base URL:** `https://api.najifasshop.com/wp-json/api/`

---

## Endpoint

```
GET /wp-json/api/store-settings
```

- **Authentication:** None required (public endpoint)
- **Method:** GET only
- **Caching:** Response may be cached aggressively (settings rarely change)

---

## Why this endpoint?

The headless Next.js frontend currently hardcodes `$` as the currency symbol
in 12+ components. This endpoint provides all store-level config the frontend
needs to render correctly — currency, tax display, shipping thresholds, etc.

Designed to be **extensible**: add new setting groups under `data` at any time
without breaking existing consumers (they just ignore unknown keys).

---

## Response Format

```json
{
  "success": true,
  "data": {

    "currency": {
      "code": "BDT",
      "symbol": "৳",
      "position": "left",
      "decimal_separator": ".",
      "thousands_separator": ",",
      "decimals": 2
    },

    "store": {
      "name": "Najifa's Shop",
      "description": "Premium fashion, delivered fast.",
      "url": "https://api.najifasshop.com",
      "country_code": "BD",
      "state": "Dhaka",
      "city": "Dhaka",
      "postcode": "1212",
      "timezone": "Asia/Dhaka",
      "locale": "en_US"
    },

    "tax": {
      "enabled": true,
      "prices_include_tax": false,
      "display_in_shop": "excl",
      "display_in_cart": "incl"
    },

    "shipping": {
      "free_shipping_enabled": true,
      "free_shipping_min_amount": 100.00,
      "weight_unit": "kg",
      "dimension_unit": "cm"
    },

    "catalog": {
      "default_sort": "menu_order",
      "products_per_page": 12,
      "ratings_enabled": true,
      "reviews_enabled": true
    }

  }
}
```

---

## Field Reference

### `currency` group

| Field | WooCommerce option key | Type | Notes |
|---|---|---|---|
| `code` | `woocommerce_currency` | string | ISO 4217, e.g. "USD", "BDT" |
| `symbol` | `get_woocommerce_currency_symbol()` | string | e.g. "$", "৳", "€" |
| `position` | `woocommerce_currency_pos` | string | `left` \| `right` \| `left_space` \| `right_space` |
| `decimal_separator` | `woocommerce_price_decimal_sep` | string | Usually "." or "," |
| `thousands_separator` | `woocommerce_price_thousand_sep` | string | Usually "," or "." |
| `decimals` | `woocommerce_price_num_decimals` | integer | Usually 2 |

### `store` group

| Field | WooCommerce option key | Type |
|---|---|---|
| `name` | `blogname` | string |
| `description` | `blogdescription` | string |
| `url` | `siteurl` | string |
| `country_code` | `woocommerce_default_country` (split on `:`) | string |
| `state` | `woocommerce_default_country` (split on `:`) | string |
| `city` | `woocommerce_store_city` | string |
| `postcode` | `woocommerce_store_postcode` | string |
| `timezone` | `timezone_string` | string |
| `locale` | `WPLANG` or `get_locale()` | string |

### `tax` group

| Field | WooCommerce option key | Type |
|---|---|---|
| `enabled` | `woocommerce_calc_taxes` === "yes" | boolean |
| `prices_include_tax` | `woocommerce_prices_include_tax` === "yes" | boolean |
| `display_in_shop` | `woocommerce_tax_display_shop` | string: `incl`\|`excl` |
| `display_in_cart` | `woocommerce_tax_display_cart` | string: `incl`\|`excl` |

### `shipping` group

| Field | Source | Type |
|---|---|---|
| `free_shipping_enabled` | Check if free shipping method exists and is enabled | boolean |
| `free_shipping_min_amount` | Free Shipping zone method `min_amount` setting | float |
| `weight_unit` | `woocommerce_weight_unit` | string: `kg`\|`g`\|`lbs`\|`oz` |
| `dimension_unit` | `woocommerce_dimension_unit` | string: `m`\|`cm`\|`mm`\|`in`\|`yd` |

### `catalog` group

| Field | WooCommerce option key | Type |
|---|---|---|
| `default_sort` | `woocommerce_default_catalog_orderby` | string |
| `products_per_page` | `posts_per_page` (shop page) | integer |
| `ratings_enabled` | `woocommerce_enable_star_rating` === "yes" | boolean |
| `reviews_enabled` | `woocommerce_enable_reviews` === "yes" | boolean |

---

## Error Response

```json
{
  "success": false,
  "code": "settings_unavailable",
  "message": "Could not load store settings."
}
```

---

## WordPress Plugin Implementation (PHP)

```php
add_action( 'rest_api_init', function () {
    register_rest_route( 'api', '/store-settings', [
        'methods'             => 'GET',
        'callback'            => 'api_get_store_settings',
        'permission_callback' => '__return_true', // public
    ] );
} );

function api_get_store_settings( WP_REST_Request $request ) {
    // --- currency ---
    $country_state = explode( ':', get_option( 'woocommerce_default_country', ':' ), 2 );

    $currency = [
        'code'                => get_woocommerce_currency(),
        'symbol'              => get_woocommerce_currency_symbol(),
        'position'            => get_option( 'woocommerce_currency_pos', 'left' ),
        'decimal_separator'   => get_option( 'woocommerce_price_decimal_sep', '.' ),
        'thousands_separator' => get_option( 'woocommerce_price_thousand_sep', ',' ),
        'decimals'            => (int) get_option( 'woocommerce_price_num_decimals', 2 ),
    ];

    // --- store ---
    $store = [
        'name'         => get_bloginfo( 'name' ),
        'description'  => get_bloginfo( 'description' ),
        'url'          => get_site_url(),
        'country_code' => $country_state[0] ?? '',
        'state'        => $country_state[1] ?? '',
        'city'         => get_option( 'woocommerce_store_city', '' ),
        'postcode'     => get_option( 'woocommerce_store_postcode', '' ),
        'timezone'     => get_option( 'timezone_string', 'UTC' ),
        'locale'       => get_locale(),
    ];

    // --- tax ---
    $tax = [
        'enabled'             => get_option( 'woocommerce_calc_taxes' ) === 'yes',
        'prices_include_tax'  => get_option( 'woocommerce_prices_include_tax' ) === 'yes',
        'display_in_shop'     => get_option( 'woocommerce_tax_display_shop', 'excl' ),
        'display_in_cart'     => get_option( 'woocommerce_tax_display_cart', 'incl' ),
    ];

    // --- shipping ---
    $free_min    = 0;
    $free_enabled = false;
    $zones = WC_Shipping_Zones::get_zones();
    foreach ( $zones as $zone ) {
        foreach ( $zone['shipping_methods'] as $method ) {
            if ( $method instanceof WC_Shipping_Free_Shipping && $method->is_enabled() ) {
                $free_enabled = true;
                $free_min     = (float) $method->get_option( 'min_amount', 0 );
                break 2;
            }
        }
    }

    $shipping = [
        'free_shipping_enabled'    => $free_enabled,
        'free_shipping_min_amount' => $free_min,
        'weight_unit'              => get_option( 'woocommerce_weight_unit', 'kg' ),
        'dimension_unit'           => get_option( 'woocommerce_dimension_unit', 'cm' ),
    ];

    // --- catalog ---
    $catalog = [
        'default_sort'     => get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ),
        'products_per_page' => (int) get_option( 'posts_per_page', 12 ),
        'ratings_enabled'  => get_option( 'woocommerce_enable_star_rating' ) === 'yes',
        'reviews_enabled'  => get_option( 'woocommerce_enable_reviews' ) === 'yes',
    ];

    return rest_ensure_response( [
        'success' => true,
        'data'    => compact( 'currency', 'store', 'tax', 'shipping', 'catalog' ),
    ] );
}
```

---

## How the Next.js frontend will consume this

```
GET /api/store-settings          ← Next.js proxy route (avoids CORS)
  → GET /wp-json/api/store-settings  ← WordPress
```

Frontend caches the response for the session. A `useCurrencyStore` Zustand
store will hold `{ symbol, position, decimals, ... }` and a `formatPrice(n)`
helper will replace all hardcoded `$` across the codebase.

---

## Adding New Settings in the Future

Simply add a new key inside `data` in the PHP response. Existing Next.js code
will ignore unknown keys. No version bump required.

Example — adding payment gateway info later:

```json
"data": {
  "currency": { ... },
  "store": { ... },
  "payments": {
    "stripe_enabled": true,
    "cod_enabled": false
  }
}
```

---
*Spec version: 1.0 — 2026-05-11*
