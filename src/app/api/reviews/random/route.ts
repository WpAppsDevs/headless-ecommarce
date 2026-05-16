import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for GET /wp-json/wpadhlwrapi/v1/reviews/random */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ?? '5';

    const wpRes = await fetch(
      `${config.apiBase}/${config.productsNs}/reviews/random?limit=${limit}`,
      { next: { revalidate: 600 } },
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
