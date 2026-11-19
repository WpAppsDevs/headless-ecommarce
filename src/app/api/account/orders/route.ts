import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { filterCheckoutDrafts } from '@/lib/order-utils';

/** Proxy for GET /wp-json/api/orders — avoids CORS for browser requests */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'No token provided' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') ?? '1';
    const per_page = searchParams.get('per_page') ?? '10';
    // WordPress filters by one status per request and rejects an unknown one.
    // Forward it only when the caller asks, so the unfiltered list stays the default.
    const status = searchParams.get('status');
    const query = new URLSearchParams({ page, per_page });
    if (status) query.set('status', status);

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/orders?${query.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        cache: 'no-store',
      },
    );

    const json = await wpRes.json();

    if (json?.success && Array.isArray(json.data)) {
      const rawOrders = json.data;
      const orders = filterCheckoutDrafts(rawOrders);
      const removed = rawOrders.length - orders.length;

      if (json.meta && typeof json.meta.total === 'number') {
        const perPage = json.meta.per_page || 10;
        json.meta.total = Math.max(0, json.meta.total - removed);
        json.meta.total_pages = Math.max(1, Math.ceil(json.meta.total / perPage));
      }

      json.data = orders;
    }

    return NextResponse.json(json, { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
