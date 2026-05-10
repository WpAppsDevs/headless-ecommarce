import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** GET /api/wishlist/check/[id] — check if a product is in the wishlist */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = req.headers.get('Authorization');

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/wishlist/check/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(auth ? { Authorization: auth } : {}),
        },
        cache: 'no-store',
      },
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
