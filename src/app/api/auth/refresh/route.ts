import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

/** Expire both auth cookies — called when refresh token is invalid/expired. */
function expireAuthCookies(response: NextResponse): void {
  response.cookies.set('access_token', '', { ...COOKIE_BASE, maxAge: 0 });
  response.cookies.set('refresh_token', '', { ...COOKIE_BASE, maxAge: 0 });
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, code: 'no_refresh_token', message: 'No refresh token' },
        { status: 401 },
      );
    }

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    );

    const json = await wpRes.json();

    if (!wpRes.ok || json?.success === false) {
      // Expired / revoked refresh token — clear stale cookies so the client
      // stops retrying with a doomed token on every subsequent page load.
      const errResponse = NextResponse.json(json, { status: wpRes.status });
      expireAuthCookies(errResponse);
      return errResponse;
    }

    // The WP plugin may return 'access_token' (same shape as login) or 'token'.
    // Accept both field names so a plugin update doesn't silently break auth.
    const newToken: string | undefined =
      json.data?.access_token ?? json.data?.token;

    if (!newToken) {
      const errResponse = NextResponse.json(
        { success: false, code: 'invalid_response', message: 'No token in refresh response' },
        { status: 502 },
      );
      expireAuthCookies(errResponse);
      return errResponse;
    }

    const response = NextResponse.json(
      { success: true, data: { token: newToken } },
      { status: 200 },
    );

    response.cookies.set('access_token', newToken, { ...COOKIE_BASE, maxAge: 3600 });

    // Persist a new refresh_token when the WP plugin uses rotating tokens.
    const newRefreshToken: string | undefined = json.data?.refresh_token;
    if (newRefreshToken) {
      response.cookies.set('refresh_token', newRefreshToken, {
        ...COOKIE_BASE,
        maxAge: 14 * 24 * 60 * 60,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
