import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const WP_WISHLIST = `${config.apiBase}/${config.apiNs}/wishlist`;

function authHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get('Authorization');
  return auth ? { Authorization: auth } : {};
}

/** GET /api/wishlist?page=&per_page= — proxies to WordPress, preserving meta */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString();

    const wpRes = await fetch(`${WP_WISHLIST}${qs ? `?${qs}` : ''}`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders(req) },
      cache: 'no-store',
    });

    const json = await wpRes.json();
    return NextResponse.json(json, { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/** POST /api/wishlist — toggle (add/remove) a product in the wishlist */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const wpRes = await fetch(WP_WISHLIST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(req) },
      body: JSON.stringify(body),
    });

    const json = await wpRes.json();
    return NextResponse.json(json, { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
