import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { applyAuthCookies } from '@/lib/auth-cookies';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/auth/register`,
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

    const response = NextResponse.json(
      { success: true, data: { user, access_token } },
      { status: 201 },
    );

    applyAuthCookies(response, { accessToken: access_token, refreshToken: refresh_token });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
