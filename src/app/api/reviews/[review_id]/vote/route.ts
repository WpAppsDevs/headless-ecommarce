import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for POST /wp-json/api/reviews/{review_id}/vote */
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
    const body = await req.text();

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/reviews/${review_id}/vote`, {
      method: 'POST',
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
