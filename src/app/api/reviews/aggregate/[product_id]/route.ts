import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for GET /wp-json/wpadhlwrapi/v1/reviews/aggregate/{product_id} */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ product_id: string }> },
) {
  try {
    const { product_id } = await params;

    const wpRes = await fetch(
      `${config.apiBase}/${config.productsNs}/reviews/aggregate/${product_id}`,
      { next: { revalidate: 300 } },
    );

    const json = await wpRes.json();
    return NextResponse.json(json, { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
