import { ApiError } from '@/lib/errors';
import { config } from '@/lib/config';
import { isCheckoutDraftStatus } from '@/lib/order-utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrackingEvent {
  status: string;
  date: string;
}

export interface TrackingInfo {
  provider: string;
  tracking_number: string | null;
  tracking_url: string | null;
  status: string;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  shipping_events: TrackingEvent[];
}

export interface TrackingOrder {
  id: number;
  status: string;
  created_at: string;
  total: string;
  currency: string;
  payment_method?: string;
  billing_email?: string;
}

export interface TrackingOrderEntry {
  order: TrackingOrder;
  tracking: TrackingInfo;
  timeline: TrackingEvent[];
}

export interface TrackingResult {
  entries: TrackingOrderEntry[];
}

export interface TrackingSearchPayload {
  email: string;
  order_id?: number;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

const FALLBACK_TRACKING: TrackingInfo = {
  provider: '',
  tracking_number: null,
  tracking_url: null,
  status: '',
  estimated_delivery: null,
  shipped_at: null,
  delivered_at: null,
  shipping_events: [],
};

function isTrackingOrder(value: unknown): value is TrackingOrder {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { id?: unknown }).id === 'number'
  );
}

function fallbackTimeline(order: TrackingOrder): TrackingEvent[] {
  return order.created_at ? [{ status: 'Order Placed', date: order.created_at }] : [];
}

function normalizeTimeline(timeline: TrackingEvent[], order: TrackingOrder): TrackingEvent[] {
  const events = Array.isArray(timeline) ? timeline.map((event) => ({ ...event })) : [];

  if (!order.created_at) return events;

  const placedIndex = events.findIndex(
    (event) => event.status.trim().toLowerCase() === 'order placed',
  );

  if (placedIndex >= 0) {
    events[placedIndex] = { ...events[placedIndex], date: order.created_at };
  } else if (events.length === 0) {
    return fallbackTimeline(order);
  }

  return events;
}

function buildEntry(
  order: TrackingOrder,
  tracking: TrackingInfo,
  timeline: TrackingEvent[],
): TrackingOrderEntry {
  return {
    order,
    tracking,
    timeline: normalizeTimeline(timeline, order),
  };
}

function normalizeTrackingResult(raw: unknown): TrackingResult {
  // Some deployments return an array of { order, tracking, timeline } objects.
  if (Array.isArray(raw)) {
    const entries = raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const { order, tracking, timeline } = item as {
          order?: unknown;
          tracking?: TrackingInfo;
          timeline?: TrackingEvent[];
        };
        if (!isTrackingOrder(order) || isCheckoutDraftStatus(order.status)) return null;
        return buildEntry(order, tracking ?? FALLBACK_TRACKING, timeline ?? []);
      })
      .filter((entry): entry is TrackingOrderEntry => entry !== null);

    return { entries };
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;

    // Single order response from GET /tracking/order/{order_id}.
    if (isTrackingOrder(obj.order)) {
      const order = obj.order;
      if (isCheckoutDraftStatus(order.status)) return { entries: [] };
      return {
        entries: [
          buildEntry(
            order,
            (obj.tracking as TrackingInfo) ?? FALLBACK_TRACKING,
            Array.isArray(obj.timeline) ? (obj.timeline as TrackingEvent[]) : [],
          ),
        ],
      };
    }

    // Guest search response: { orders: [...], tracking, timeline }. The backend
    // only attaches tracking/timeline for the most recent order, so older orders
    // get a minimal timeline built from their own created_at.
    if (Array.isArray(obj.orders)) {
      const sharedTracking = (obj.tracking as TrackingInfo) ?? FALLBACK_TRACKING;
      const sharedTimeline = Array.isArray(obj.timeline) ? (obj.timeline as TrackingEvent[]) : [];

      const entries = obj.orders
        .filter((order): order is TrackingOrder => {
          return isTrackingOrder(order) && !isCheckoutDraftStatus(order.status);
        })
        .map((order, index) => {
          if (index === 0) {
            return buildEntry(order, sharedTracking, sharedTimeline);
          }
          return buildEntry(order, FALLBACK_TRACKING, fallbackTimeline(order));
        });

      return { entries };
    }
  }

  return { entries: [] };
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

export async function searchTracking(payload: TrackingSearchPayload): Promise<TrackingResult> {
  const isClient = typeof window !== 'undefined';
  const url = isClient ? '/api/tracking/search' : `${config.apiBase}/${config.apiNs}/tracking/search`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || json?.success === false) {
    if (json?.code === 'no_orders_found') {
      return { entries: [] };
    }
    throw json?.code && json?.message
      ? new ApiError(json.code, json.message)
      : new ApiError('api_error', `HTTP ${res.status}`);
  }

  return normalizeTrackingResult(json.data);
}

/**
 * Authenticated user tracking their own order by ID.
 * Calls GET /wp-json/{apiNs}/tracking/order/{id} via Next.js proxy.
 * Requires Authorization: Bearer {token} header.
 */
export async function getTrackingByOrderId(orderId: number): Promise<TrackingResult> {
  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/tracking/order/${orderId}`
    : `${config.apiBase}/${config.apiNs}/tracking/order/${orderId}`;

  const headers: Record<string, string> = {};

  if (isClient) {
    try {
      const { tokenCache } = await import('./client');
      const token = tokenCache.get();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Not on client — skip token injection
    }
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const json = await res.json();

  if (!res.ok || json?.success === false) {
    if (json?.code === 'not_found' || json?.code === 'no_orders_found') {
      return { entries: [] };
    }
    throw json?.code && json?.message
      ? new ApiError(json.code, json.message)
      : new ApiError('api_error', `HTTP ${res.status}`);
  }

  return normalizeTrackingResult(json.data);
}
