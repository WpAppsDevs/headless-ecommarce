import { NextResponse } from 'next/server';
import { expireAuthCookies } from '@/lib/auth-cookies';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  expireAuthCookies(response);

  return response;
}
