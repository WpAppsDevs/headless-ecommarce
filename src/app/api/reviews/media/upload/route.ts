import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for POST /wp-json/api/reviews/media/upload (multipart/form-data, one file at a time) */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'No token provided' },
        { status: 401 },
      );
    }

    // Parse multipart from the client and forward as-is to WordPress.
    // Do NOT set Content-Type — fetch will attach the boundary automatically.
    const formData = await req.formData();

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/reviews/media/upload`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: formData,
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
