import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';

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
      return NextResponse.json(json, { status: wpRes.status });
    }

    const newToken: string = json.data.token;

    const response = NextResponse.json(
      { success: true, data: { token: newToken } },
      { status: 200 },
    );

    response.cookies.set('access_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
