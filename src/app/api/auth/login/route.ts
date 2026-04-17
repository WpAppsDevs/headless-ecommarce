import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

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

    response.cookies.set('access_token', access_token, {
      ...COOKIE_BASE,
      maxAge: 3600, // 1 hour
    });

    response.cookies.set('refresh_token', refresh_token, {
      ...COOKIE_BASE,
      maxAge: 14 * 24 * 60 * 60, // 14 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
