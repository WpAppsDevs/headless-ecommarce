# Shop Filter API — Endpoint Specification

**For:** WordPress API plugin developer  
**Namespace:** `wpadhlwrapi/v1`  
**Base URL:** `https://api.najifasshop.com/wp-json/wpadhlwrapi/v1/`

---

## Background

The headless Next.js shop page (`/products`) has a sidebar with filters for
**Categories**, **Tags**, **Brands**, **Colors**, **Sizes**, and **Price Range**.

Currently:
- Categories come from embedded product data (only current-page products — incomplete)
- Tags, Brands, Colors, Sizes are **hardcoded** in the frontend
- Colors and Sizes do **not** filter the product list at all (no API support)

These 4 new endpoints + 1 products endpoint update will make all filters fully
dynamic from WooCommerce data.

> **Brand taxonomy note:** Brands in this store are registered as the custom
> taxonomy `product_brand` (not a WooCommerce product attribute). They behave
> like Categories and Tags — `get_terms('product_brand')` — and **must not**
> appear in the `product-attributes` endpoint.

---

## Endpoint 1 — Product Categories

```
GET /wp-json/wpadhlwrapi/v1/product-categories
```

Returns **all** published WooCommerce product categories.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `hide_empty` | boolean | `true` | Only return categories that have products |
| `per_page` | int | `100` | Max results |
| `parent` | int | — | Filter by parent category ID (for nested cats) |

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 30,
      "name": "Women",
      "slug": "women",
      "parent": 0,
      "description": "",
      "count": 45,
      "image": "https://api.najifasshop.com/wp-content/uploads/women.jpg"
    },
    {
      "id": 31,
      "name": "Kurta",
      "slug": "kurta",
      "parent": 30,
      "description": "",
      "count": 18,
      "image": null
    }
  ],
  "meta": {
    "total": 12
  }
}
```

### PHP Implementation Notes

```php
register_rest_route('wpadhlwrapi/v1', '/product-categories', [
    'methods'             => 'GET',
    'callback'            => 'wpadhlwrapi_get_product_categories',
    'permission_callback' => '__return_true',
    'args' => [
        'hide_empty' => [ 'default' => true,  'sanitize_callback' => 'rest_sanitize_boolean' ],
        'per_page'   => [ 'default' => 100,   'sanitize_callback' => 'absint' ],
        'parent'     => [ 'default' => null ],
    ],
]);

function wpadhlwrapi_get_product_categories( WP_REST_Request $request ) {
    $args = [
        'taxonomy'   => 'product_cat',
        'hide_empty' => $request['hide_empty'],
        'number'     => $request['per_page'],
        'orderby'    => 'name',
        'order'      => 'ASC',
    ];
    if ( $request['parent'] !== null ) {
        $args['parent'] = absint( $request['parent'] );
    }
    $terms = get_terms( $args );
    if ( is_wp_error( $terms ) ) {
        return new WP_Error('fetch_error', $terms->get_error_message(), ['status' => 500]);
    }
    $data = array_map( function( $term ) {
        $thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
        $image        = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : null;
        return [
            'id'          => $term->term_id,
            'name'        => $term->name,
            'slug'        => $term->slug,
            'parent'      => $term->parent,
            'description' => $term->description,
            'count'       => $term->count,
            'image'       => $image,
        ];
    }, $terms );
    return rest_ensure_response([
        'success' => true,
        'data'    => $data,
        'meta'    => [ 'total' => count( $data ) ],
    ]);
}
```

---

## Endpoint 2 — Product Tags

```
GET /wp-json/wpadhlwrapi/v1/product-tags
```

Returns **all** WooCommerce product tags.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `hide_empty` | boolean | `true` | Only tags with at least 1 product |
| `per_page` | int | `100` | Max results |

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 41,
      "name": "Ready Stock",
      "slug": "ready-stock",
      "count": 12
    },
    {
      "id": 42,
      "name": "Pre-Order",
      "slug": "pre-order",
      "count": 7
    }
  ],
  "meta": {
    "total": 8
  }
}
```

### PHP Implementation Notes

```php
register_rest_route('wpadhlwrapi/v1', '/product-tags', [
    'methods'             => 'GET',
    'callback'            => 'wpadhlwrapi_get_product_tags',
    'permission_callback' => '__return_true',
    'args' => [
        'hide_empty' => [ 'default' => true, 'sanitize_callback' => 'rest_sanitize_boolean' ],
        'per_page'   => [ 'default' => 100,  'sanitize_callback' => 'absint' ],
    ],
]);

function wpadhlwrapi_get_product_tags( WP_REST_Request $request ) {
    $terms = get_terms([
        'taxonomy'   => 'product_tag',
        'hide_empty' => $request['hide_empty'],
        'number'     => $request['per_page'],
        'orderby'    => 'name',
        'order'      => 'ASC',
    ]);
    if ( is_wp_error( $terms ) ) {
        return new WP_Error('fetch_error', $terms->get_error_message(), ['status' => 500]);
    }
    $data = array_map( fn($t) => [
        'id'    => $t->term_id,
        'name'  => $t->name,
        'slug'  => $t->slug,
        'count' => $t->count,
    ], $terms );
    return rest_ensure_response([
        'success' => true,
        'data'    => $data,
        'meta'    => [ 'total' => count( $data ) ],
    ]);
}
```

---

## Endpoint 3 — Product Brands

```
GET /wp-json/wpadhlwrapi/v1/product-brands
```

Returns **all** terms from the `product_brand` custom taxonomy.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `hide_empty` | boolean | `true` | Only brands with at least 1 product |
| `per_page` | int | `100` | Max results |

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 51,
      "name": "Khaadi",
      "slug": "khaadi",
      "count": 6,
      "image": "https://api.najifasshop.com/wp-content/uploads/khaadi-logo.jpg"
    },
    {
      "id": 52,
      "name": "Gul Ahmed",
      "slug": "gul-ahmed",
      "count": 4,
      "image": null
    }
  ],
  "meta": {
    "total": 10
  }
}
```

> `image` is stored as term meta `thumbnail_id` (same pattern as `product_cat`).
> Return `null` if no image is set.

### PHP Implementation Notes

```php
register_rest_route('wpadhlwrapi/v1', '/product-brands', [
    'methods'             => 'GET',
    'callback'            => 'wpadhlwrapi_get_product_brands',
    'permission_callback' => '__return_true',
    'args' => [
        'hide_empty' => [ 'default' => true, 'sanitize_callback' => 'rest_sanitize_boolean' ],
        'per_page'   => [ 'default' => 100,  'sanitize_callback' => 'absint' ],
    ],
]);

function wpadhlwrapi_get_product_brands( WP_REST_Request $request ) {
    $cache_key = 'wpadhlwrapi_product-brands';
    $cached    = get_transient( $cache_key );
    if ( $cached !== false ) {
        return rest_ensure_response( $cached );
    }

    $terms = get_terms([
        'taxonomy'   => 'product_brand',  // custom taxonomy, NOT pa_brand attribute
        'hide_empty' => $request['hide_empty'],
        'number'     => $request['per_page'],
        'orderby'    => 'name',
        'order'      => 'ASC',
    ]);
    if ( is_wp_error( $terms ) ) {
        return new WP_Error('fetch_error', $terms->get_error_message(), ['status' => 500]);
    }
    $data = array_map( function( $term ) {
        $thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
        $image        = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : null;
        return [
            'id'    => $term->term_id,
            'name'  => $term->name,
            'slug'  => $term->slug,
            'count' => $term->count,
            'image' => $image,
        ];
    }, $terms );

    $response = [
        'success' => true,
        'data'    => $data,
        'meta'    => [ 'total' => count( $data ) ],
    ];
    set_transient( $cache_key, $response, HOUR_IN_SECONDS * 6 );
    return rest_ensure_response( $response );
}
```

---

## Endpoint 4 — Product Attributes (Colors, Sizes)

```
GET /wp-json/wpadhlwrapi/v1/product-attributes
```

Returns WooCommerce product attribute terms (e.g. Color, Size) grouped by
attribute. **Brands are excluded** — they use the `product_brand` taxonomy
and are served by `/product-brands` above.

### Query Parameters

None required. Returns all attributes and their terms.

### Response Format

```json
{
  "success": true,
  "data": {
    "pa_color": {
      "id": 1,
      "name": "Color",
      "slug": "pa_color",
      "terms": [
        { "id": 10, "name": "Red",   "slug": "red",   "count": 5 },
        { "id": 11, "name": "Black", "slug": "black", "count": 8 }
      ]
    },
    "pa_size": {
      "id": 2,
      "name": "Size",
      "slug": "pa_size",
      "terms": [
        { "id": 20, "name": "S",  "slug": "s",  "count": 10 },
        { "id": 21, "name": "M",  "slug": "m",  "count": 14 },
        { "id": 22, "name": "L",  "slug": "l",  "count": 12 },
        { "id": 23, "name": "XL", "slug": "xl", "count": 9  }
      ]
    }
  }
}
```

> **Note:** `pa_brand` is intentionally absent. Brands are a custom taxonomy
> (`product_brand`), not a WooCommerce attribute. See Endpoint 3 above.
>
> The attribute slugs (`pa_color`, `pa_size`) use WooCommerce's default `pa_`
> prefix. If your store uses different attribute names, the response will
> reflect whatever you have in WooCommerce → Products → Attributes.

### PHP Implementation Notes

```php
register_rest_route('wpadhlwrapi/v1', '/product-attributes', [
    'methods'             => 'GET',
    'callback'            => 'wpadhlwrapi_get_product_attributes',
    'permission_callback' => '__return_true',
]);

function wpadhlwrapi_get_product_attributes( WP_REST_Request $request ) {
    // Get all registered WooCommerce attributes
    $attribute_taxonomies = wc_get_attribute_taxonomies();
    $data = [];

    foreach ( $attribute_taxonomies as $attr ) {
        $taxonomy = wc_attribute_taxonomy_name( $attr->attribute_name ); // e.g. "pa_color"
        $terms    = get_terms([
            'taxonomy'   => $taxonomy,
            'hide_empty' => true,
            'orderby'    => 'name',
            'order'      => 'ASC',
        ]);
        if ( is_wp_error( $terms ) || empty( $terms ) ) continue;

        $data[ $taxonomy ] = [
            'id'    => (int) $attr->attribute_id,
            'name'  => $attr->attribute_label,
            'slug'  => $taxonomy,
            'terms' => array_map( fn($t) => [
                'id'    => $t->term_id,
                'name'  => $t->name,
                'slug'  => $t->slug,
                'count' => $t->count,
            ], $terms ),
        ];
    }

    return rest_ensure_response([
        'success' => true,
        'data'    => $data,
    ]);
}
```

---

## Endpoint 5 — Products Endpoint Update (Attribute + Brand Filtering)

The existing `GET /wpadhlwrapi/v1/products` endpoint needs support for
attribute filter query parameters so Colors, Sizes, and Brands can be
filtered server-side.

### New Query Parameters to Add

| Param | Example | Maps to |
|-------|---------|---------|
| `color` | `?color=red` | `tax_query` on `pa_color` taxonomy (WC attribute) |
| `size` | `?size=m` | `tax_query` on `pa_size` taxonomy (WC attribute) |
| `brand` | `?brand=khaadi` | `tax_query` on `product_brand` taxonomy (custom taxonomy) |

> These can be generalised as `?attribute[pa_color]=red` if you prefer a
> single flexible param, but individual params are simpler for the frontend.

### PHP Implementation Notes

Inside your existing products query handler, add to the `WP_Query` args:

```php
$tax_query = [];

if ( ! empty( $request['color'] ) ) {
    $tax_query[] = [
        'taxonomy' => 'pa_color',
        'field'    => 'slug',
        'terms'    => sanitize_text_field( $request['color'] ),
    ];
}
if ( ! empty( $request['size'] ) ) {
    $tax_query[] = [
        'taxonomy' => 'pa_size',
        'field'    => 'slug',
        'terms'    => sanitize_text_field( $request['size'] ),
    ];
}
if ( ! empty( $request['brand'] ) ) {
    // product_brand is a custom taxonomy (like product_cat), NOT a WC attribute
    $tax_query[] = [
        'taxonomy' => 'product_brand',
        'field'    => 'slug',
        'terms'    => sanitize_text_field( $request['brand'] ),
    ];
}

if ( ! empty( $tax_query ) ) {
    $tax_query['relation'] = 'AND';
    $args['tax_query']     = $tax_query;
}
```

---

## Caching Recommendation

All 4 filter endpoints (`product-categories`, `product-tags`, `product-brands`,
`product-attributes`) can be cached aggressively since they change infrequently:

```php
// At the top of each callback, before get_terms():
$cache_key  = 'wpadhlwrapi_' . $endpoint_name;
$cached     = get_transient( $cache_key );
if ( $cached !== false ) {
    return rest_ensure_response( $cached );
}
// ... build $response ...
set_transient( $cache_key, $response, HOUR_IN_SECONDS * 6 );
return rest_ensure_response( $response );
```

Clear the transients when products/terms are updated:
```php
add_action('created_term', 'wpadhlwrapi_clear_filter_cache');
add_action('edited_term',  'wpadhlwrapi_clear_filter_cache');
add_action('delete_term',  'wpadhlwrapi_clear_filter_cache');
function wpadhlwrapi_clear_filter_cache() {
    delete_transient('wpadhlwrapi_product-categories');
    delete_transient('wpadhlwrapi_product-tags');
    delete_transient('wpadhlwrapi_product-brands');
    delete_transient('wpadhlwrapi_product-attributes');
}
```

---

## Frontend Integration Plan (Next.js)

Once these endpoints are live, the frontend changes will be:

1. **`src/app/api/product-filters/route.ts`** — Proxy route (CORS fix, same pattern as `/api/store-settings`); proxies categories, tags, **brands**, and attributes
2. **`src/lib/api/filters.ts`** — `getProductFilters()` fetch function (includes `product-brands` call)
3. **`src/app/(shop)/products/page.tsx`** — Fetch categories + tags + **brands** + attributes at build/request time (server component), pass as props to `ShopClient`
4. **`src/components/shop/ShopSidebar.tsx`** — Remove hardcoded arrays; accept `tags`, `brands`, `colors`, `sizes` as props (`brands` now comes from taxonomy, not attributes)
5. **`src/components/shop/ShopClient.tsx`** — Pass attribute + brand props through to sidebar; add `color`/`size`/`brand` to URL params when filtering

No new dependencies needed — uses the same patterns already in the codebase.
