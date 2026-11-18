import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { applyAuthCookies, expireAuthCookies } from '@/lib/auth-cookies';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      const errResponse = NextResponse.json(
        { success: false, code: 'no_refresh_token', message: 'No refresh token' },
        { status: 401 },
      );
      expireAuthCookies(errResponse);
      return errResponse;
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

    /**
     * The plugin returns the profile with the new token, so the client needs no
     * second call. Older plugin versions omit it; then fetch it here, which is
     * why the client has no /api/auth/me fallback of its own. A failure must not
     * fail the refresh: the token is still valid.
     */
    let profile: unknown = json.data?.user ?? null;
    if (!profile) {
      try {
        const meRes = await fetch(`${config.apiBase}/${config.apiNs}/user`, {
          headers: { Authorization: `Bearer ${newToken}` },
          cache: 'no-store',
        });
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson?.success && meJson.data) profile = meJson.data;
        }
      } catch {
        profile = null;
      }
    }

    const response = NextResponse.json(
      { success: true, data: { token: newToken, profile } },
      { status: 200 },
    );

    // The plugin may rotate the refresh token; keep the current one when it does not.
    const currentRefreshToken = cookieStore.get('refresh_token')?.value ?? '';
    applyAuthCookies(response, {
      accessToken: newToken,
      refreshToken: json.data?.refresh_token ?? currentRefreshToken,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
