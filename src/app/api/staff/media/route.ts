import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * POST /api/staff/media — one product image, multipart.
 *
 * The body is forwarded as parsed FormData; setting Content-Type here would
 * drop the boundary the browser added.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization');

    if (!auth) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/staff/media`, {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
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
