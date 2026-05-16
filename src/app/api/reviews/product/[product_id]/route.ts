import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for GET /wp-json/wpadhlwrapi/v1/reviews/product/{product_id} */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ product_id: string }> },
) {
  try {
    const { product_id } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') ?? '1';
    const per_page = searchParams.get('per_page') ?? '10';
    const orderby = searchParams.get('orderby') ?? 'created_at';

    const wpRes = await fetch(
      `${config.apiBase}/${config.productsNs}/reviews/product/${product_id}?page=${page}&per_page=${per_page}&orderby=${orderby}`,
      { cache: 'no-store' },
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
