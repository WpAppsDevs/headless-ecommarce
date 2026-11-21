import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Staff access check proxy.
 *
 * Forward only; WordPress answers 200/403 and the browser learns nothing it
 * could have guessed.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json(
      { success: false, code: 'no_token', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/staff/access`, {
      method: 'GET',
      headers: { Authorization: authHeader },
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
