import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { applyAuthCookies } from '@/lib/auth-cookies';

/**
 * Proxy for POST /wp-json/api/user/password — the change-password route.
 *
 * The plugin revokes every token issued before the change, so the response
 * carries a fresh pair. Both hop through this route for the same reason the
 * profile update does: the WordPress origin is not reachable from the browser,
 * and the password must never travel in a URL.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'No token provided' },
        { status: 401 },
      );
    }

    const body = await req.text();

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/user/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body,
      cache: 'no-store',
    });

    const json = await wpRes.json();

    if (!wpRes.ok || json?.success === false) {
      return NextResponse.json(json, { status: wpRes.status });
    }

    const { access_token, refresh_token } = json.data;

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { success: false, code: 'invalid_response', message: 'No token pair returned' },
        { status: 502 },
      );
    }

    // Same cookies as login: the pair issued before the change no longer works.
    const response = NextResponse.json({ success: true, data: { access_token } });
    applyAuthCookies(response, { accessToken: access_token, refreshToken: refresh_token });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
