import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Proxy for DELETE /wp-json/api/reviews/{review_id} */
export async function DELETE(
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

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/reviews/${review_id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
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
