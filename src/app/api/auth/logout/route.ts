import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Expire both auth cookies immediately
  const expireOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('access_token', '', expireOpts);
  response.cookies.set('refresh_token', '', expireOpts);

  return response;
}
