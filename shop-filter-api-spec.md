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

These 3 new endpoints + 1 products endpoint update will make all filters fully
dynamic from WooCommerce data.

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

## Endpoint 3 — Product Attributes (Colors, Sizes, Brands)

```
GET /wp-json/wpadhlwrapi/v1/product-attributes
```

Returns all WooCommerce product attribute terms grouped by attribute name.
This powers the **Color**, **Size**, and **Brand** filters dynamically.

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
    },
    "pa_brand": {
      "id": 3,
      "name": "Brand",
      "slug": "pa_brand",
      "terms": [
        { "id": 30, "name": "Khaadi",     "slug": "khaadi",     "count": 6 },
        { "id": 31, "name": "Gul Ahmed",  "slug": "gul-ahmed",  "count": 4 }
      ]
    }
  }
}
```

> **Note:** The attribute slugs (`pa_color`, `pa_size`, `pa_brand`) are
> WooCommerce's default prefix. If your store uses different attribute names,
> the response will reflect whatever you have in WooCommerce → Products → Attributes.

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

## Endpoint 4 — Products Endpoint Update (Attribute Filtering)

The existing `GET /wpadhlwrapi/v1/products` endpoint needs support for
attribute filter query parameters so Colors, Sizes, and Brands can be
filtered server-side.

### New Query Parameters to Add

| Param | Example | Maps to |
|-------|---------|---------|
| `color` | `?color=red` | `tax_query` on `pa_color` taxonomy |
| `size` | `?size=m` | `tax_query` on `pa_size` taxonomy |
| `brand` | `?brand=khaadi` | `tax_query` on `pa_brand` taxonomy |

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
    // "brand" can be a product_tag, a custom taxonomy, or pa_brand attribute
    // Use whichever matches your WooCommerce setup:
    $tax_query[] = [
        'taxonomy' => 'pa_brand', // or 'product_tag' if brand is a tag
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

All 3 filter endpoints (`product-categories`, `product-tags`, `product-attributes`)
can be cached aggressively since they change infrequently:

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
    delete_transient('wpadhlwrapi_product-attributes');
}
```

---

## Frontend Integration Plan (Next.js)

Once these endpoints are live, the frontend changes will be:

1. **`src/app/api/product-filters/route.ts`** — Proxy route (CORS fix, same pattern as `/api/store-settings`)
2. **`src/lib/api/filters.ts`** — `getProductFilters()` fetch function
3. **`src/app/(shop)/products/page.tsx`** — Fetch categories + tags + attributes at build/request time (server component), pass as props to `ShopClient`
4. **`src/components/shop/ShopSidebar.tsx`** — Remove hardcoded arrays; accept `tags`, `brands`, `colors`, `sizes` as props
5. **`src/components/shop/ShopClient.tsx`** — Pass attribute props through to sidebar; add `color`/`size`/`brand` to URL params when filtering

No new dependencies needed — uses the same patterns already in the codebase.
