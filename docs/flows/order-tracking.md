# Order tracking flow

## Two lookup modes

| Visitor | UI fields | API | Identity |
| --- | --- | --- | --- |
| Guest | Email required, order number optional | `POST /api/tracking/search` | Billing email |
| Signed in | Order number required, email hidden | `GET /api/tracking/order/:id` | Bearer token |

The page chooses the mode from `authStore.isAuthenticated` after hydration.

`TrackingForm` validates accordingly. A guest with an empty email sees "Email is required"; an invalid email sees "Please enter a valid email address"; a signed-in user with no order number cannot submit.

## Guest search

```
TrackingForm
  → searchTracking({ email, order_id? })
  → POST /api/tracking/search
  → WordPress POST /wp-json/api/tracking/search
  → normalizeTrackingResult(json.data)
  → { entries }
```

The route is a pure proxy. It reads an `Authorization` header but does not forward it, so guest search has no session. The backend decides whether an email plus ID is enough to return an order. The front end must not add an ID-only lookup.

## Signed-in lookup

```
TrackingForm
  → getTrackingByOrderId(orderId)
  → GET /api/tracking/order/:id with Bearer token
  → WordPress GET /wp-json/api/tracking/order/:id
  → normalizeTrackingResult(json.data)
```

The route rejects a missing `Authorization` header with 401 before calling WordPress.

## The three response shapes

`normalizeTrackingResult()` accepts:

### 1. Array of entries

```json
[
  { "order": { "id": 151, "status": "processing" }, "tracking": {}, "timeline": [] }
]
```

Each item is normalized separately. Entries with `checkout-draft` status are dropped.

### 2. Single order object

```json
{ "order": { "id": 151 }, "tracking": {}, "timeline": [] }
```

A checkout draft returns `{ entries: [] }`.

### 3. Orders plus shared tracking

```json
{
  "orders": [{ "id": 151 }, { "id": 45 }],
  "tracking": { "provider": "..." },
  "timeline": [{ "status": "Order Placed", "date": "..." }]
}
```

The backend attaches carrier info and timeline only to the newest order. The normalizer gives the shared data to the first order and a fallback "Order Placed" timeline to the rest.

## Timeline normalization

`normalizeTimeline(timeline, order)`:

1. Copies the events.
2. Returns them unchanged if the order has no `created_at`.
3. Finds a case-insensitive "Order Placed" event and replaces its date with `order.created_at`.
4. If there are no events, creates one from `created_at`.
5. Returns the events.

`TrackingTimeline` marks the last event as completed, and any event whose status appears in the completed set. The current status banner uses `tracking.status` when present and falls back to `order.status`.

`TrackingAccordion` colors statuses: completed green, processing accent, pending zinc, cancelled red, refunded yellow, on-hold orange. An unknown status falls back to pending.

## Rendering

- Results are accordions. The first is open by default.
- Five entries are shown; "Show more orders" reveals the rest.
- `checkout-draft` entries are filtered in the page and again in the normalizer.
- Empty results show "No orders found for this email address" or "No orders found with this order number".
- Errors show the API message inside a red panel. A network failure becomes "Something went wrong".

## Privacy

The backend is responsible for matching email to order. Do not change the client to look up an order by ID alone. The coding standards in `.commandcode/taste/coding/taste.md` record the same rule: verify both the identifier and the customer email before returning order data.

## Failure states

| Failure | User sees |
| --- | --- |
| No orders for email | Empty state, not an error |
| Order ID not found for signed-in user | Empty state |
| API error | Red panel with the server message |
| Network error | Generic error |
| Malformed response | `{ entries: [] }` from the normalizer |

`no_orders_found` and `not_found` are treated as empty results, not exceptions. Other codes throw `ApiError`.

## Components

| Component | Responsibility |
| --- | --- |
| `TrackingForm` | Input mode, validation, submit |
| `TrackingAccordion` | Order header, status, details, timeline |
| `TrackingTimeline` | Event list and current status |
| `TrackingStatus` | One event row |

The page owns loading, error, and result state. The components are presentational.

## Test cases

- Guest email only returns all orders for that email.
- Guest email plus order ID returns one order.
- Wrong email with a valid order ID returns no orders.
- Signed-in user without a token gets a redirect or an empty state; the route returns 401.
- A `checkout-draft` order never appears.
- An order with no timeline shows "Order Placed".
- An order with an "Order Placed" event has its date corrected to `created_at`.
- More than five results hides the rest behind "Show more orders".
- Bengali page title and breadcrumbs still render on mobile.

## Related

- [../data-layer.md](../data-layer.md)
- [../routing-and-pages.md](../routing-and-pages.md)
- [../components.md](../components.md)
