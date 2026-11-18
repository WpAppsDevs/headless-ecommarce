import { NextResponse } from 'next/server';

/**
 * Auth cookies, written the same way everywhere.
 *
 * Login, refresh and password change all hand the browser an access token and a
 * refresh token. Three copies of the flags meant a security change had to be
 * made in three places, so the constants and the two operations live here.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

export const ACCESS_TOKEN_MAX_AGE = 3600;
export const REFRESH_TOKEN_MAX_AGE = 14 * 24 * 60 * 60;

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

/** Store a fresh token pair. `session_hint` is readable: it only says "try a refresh". */
export function applyAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
): void {
  response.cookies.set('access_token', tokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set('refresh_token', tokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
  response.cookies.set('session_hint', '1', {
    ...COOKIE_BASE,
    httpOnly: false,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/** Clear the pair after a failed refresh or a sign-out. */
export function expireAuthCookies(response: NextResponse): void {
  response.cookies.set('access_token', '', { ...COOKIE_BASE, maxAge: 0 });
  response.cookies.set('refresh_token', '', { ...COOKIE_BASE, maxAge: 0 });
  response.cookies.set('session_hint', '', {
    ...COOKIE_BASE,
    httpOnly: false,
    maxAge: 0,
  });
}
