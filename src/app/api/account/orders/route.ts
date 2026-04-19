import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

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

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/orders?page=${page}&per_page=${per_page}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
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
