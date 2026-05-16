import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for POST /wp-json/api/reviews/{review_id}/media (multipart/form-data) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ review_id: string }> },
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'No token provided' },
        { status: 401 },
      );
    }

    const { review_id } = await params;

    // Parse multipart from the client request and forward as-is to WordPress.
    // Re-use req.formData() so we don't buffer the raw multipart manually.
    const formData = await req.formData();

    // Do NOT set Content-Type — fetch will attach the boundary automatically.
    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/reviews/${review_id}/media`, {
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
