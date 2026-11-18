import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

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

    // Same lifetime and flags as login: the old pair no longer works.
    const response = NextResponse.json({ success: true, data: { access_token } });

    response.cookies.set('access_token', access_token, {
      ...COOKIE_BASE,
      maxAge: 3600,
    });
    response.cookies.set('refresh_token', refresh_token, {
      ...COOKIE_BASE,
      maxAge: 14 * 24 * 60 * 60,
    });
    response.cookies.set('session_hint', '1', {
      ...COOKIE_BASE,
      httpOnly: false,
      maxAge: 14 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
