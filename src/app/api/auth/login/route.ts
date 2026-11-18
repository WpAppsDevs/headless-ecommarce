import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { applyAuthCookies } from '@/lib/auth-cookies';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    const json = await wpRes.json();

    if (!wpRes.ok || json?.success === false) {
      return NextResponse.json(json, { status: wpRes.status });
    }

    const { access_token, refresh_token, user } = json.data;

    // Return access_token to client so authStore can populate tokenCache
    const response = NextResponse.json(
      { success: true, data: { user, access_token } },
      { status: 200 },
    );

    // 1-hour access token, 14-day refresh token, plus the readable session hint.
    applyAuthCookies(response, { accessToken: access_token, refreshToken: refresh_token });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
