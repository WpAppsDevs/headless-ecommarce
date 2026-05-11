import { NextResponse } from 'next/server';
import { getProductFilters } from '@/lib/api/filters';

/**
 * GET /api/product-filters
 *
 * Returns all shop sidebar filter data in one call.
 * Acts as a CORS-safe proxy — the browser hits this Next.js route,
 * the server calls WordPress directly (no CORS issue).
 *
 * Cached 6 hours on the CDN; WordPress clears transients on term changes.
 */
export async function GET() {
  try {
    const filters = await getProductFilters();
    return NextResponse.json(
      { success: true, data: filters },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
        },
      },
    );
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Failed to fetch filter data' },
      { status: 500 },
    );
  }
}
