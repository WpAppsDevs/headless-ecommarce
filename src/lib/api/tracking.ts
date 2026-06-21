import { ApiError } from '@/lib/errors';
import { config } from '@/lib/config';

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

export interface TrackingResult {
  orders: TrackingOrder[];
  tracking: TrackingInfo;
  timeline: TrackingEvent[];
}

export interface TrackingSearchPayload {
  email: string;
  order_id?: number;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

export async function searchTracking(payload: TrackingSearchPayload): Promise<TrackingResult> {
  const isClient = typeof window !== 'undefined';
  const url = isClient ? '/api/tracking/search' : `${config.apiBase}/${config.apiNs}/tracking/search`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

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
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || json?.success === false) {
    throw json?.code && json?.message
      ? new ApiError(json.code, json.message)
      : new ApiError('api_error', `HTTP ${res.status}`);
  }

  const raw = json.data;

  // API returns a single order object — wrap in array for UI consumption
  return {
    orders: raw.order ? [raw.order] : [],
    tracking: raw.tracking ?? {
      provider: '',
      tracking_number: null,
      tracking_url: null,
      status: '',
      estimated_delivery: null,
      shipped_at: null,
      delivered_at: null,
      shipping_events: [],
    },
    timeline: raw.timeline ?? [],
  };
}
