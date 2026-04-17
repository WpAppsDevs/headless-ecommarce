import { tokenCache } from './client';
import { ApiError } from '@/lib/errors';
import { config } from '@/lib/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderLineItem {
  product_id: number;
  name: string;
  quantity: number;
  line_total: string;
}

export interface Order {
  id: number;
  status: string;
  currency: string;
  total: string;
  date_created: string | null;
  line_items: OrderLineItem[];
}

export interface OrdersMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface OrdersResult {
  orders: Order[];
  meta: OrdersMeta;
}

// ---------------------------------------------------------------------------
// API function
// ---------------------------------------------------------------------------

/**
 * GET /wp-json/api/orders — paginated order history.
 * Uses raw fetch (not apiClient) to preserve the `meta` pagination field.
 * Throws ApiError on 401 so the caller can redirect to /login.
 */
export async function getOrders(page = 1, perPage = 10): Promise<OrdersResult> {
  const token = tokenCache.get();
  const url = `${config.apiBase}/api/orders?page=${page}&per_page=${perPage}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: Order[];
    meta?: OrdersMeta;
    code?: string;
    message?: string;
  };

  if (!json.success) {
    throw new ApiError(json.code ?? 'api_error', json.message ?? 'Failed to load orders');
  }

  return {
    orders: json.data ?? [],
    meta: json.meta ?? { page, per_page: perPage, total: 0, total_pages: 0 },
  };
}
