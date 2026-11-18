import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Proxy for PUT /wp-json/api/user — the profile and address update route.
 *
 * The WordPress site is a different origin, so the browser cannot call it
 * directly without a CORS preflight the REST plugin does not opt into. The
 * access token stays in the Authorization header on both hops; it is never
 * copied into a cookie or a query string.
 */
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'No token provided' },
        { status: 401 },
      );
    }

    const body = await req.text();

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body,
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
