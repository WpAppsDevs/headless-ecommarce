import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** GET /api/staff/products — paginated product list */
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization');

    if (!auth) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const search = req.nextUrl.searchParams.toString();
    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/staff/products${search ? `?${search}` : ''}`,
      {
        method: 'GET',
        headers: { Authorization: auth },
        cache: 'no-store',
      },
    );

    return NextResponse.json(await wpRes.json(), { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/** POST /api/staff/products — create a simple product */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization');

    if (!auth) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await req.text();
    const idempotencyKey = req.headers.get('Idempotency-Key');

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/staff/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body,
      cache: 'no-store',
    });

    return NextResponse.json(await wpRes.json(), { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
