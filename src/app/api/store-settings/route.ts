import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** GET /api/store-settings — proxies to WordPress to avoid CORS */
export async function GET() {
  try {
    const wpRes = await fetch(
      `${config.apiBase}/${config.productsNs}/store-settings`,
      { next: { revalidate: 3600 } }, // cache 1 hour — settings rarely change
    );

    if (!wpRes.ok) {
      return NextResponse.json(
        { success: false, code: 'upstream_error', message: `HTTP ${wpRes.status}` },
        { status: wpRes.status },
      );
    }

    const json = await wpRes.json();
    return NextResponse.json(json, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Failed to fetch store settings' },
      { status: 500 },
    );
  }
}
