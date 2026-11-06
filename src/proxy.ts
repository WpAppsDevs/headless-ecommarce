import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight route guard for pages that need a session.
 *
 * This checks cookie presence only. WordPress still authorizes every data
 * request; this exists so anonymous visitors do not see the account or
 * checkout shell before the client-side redirect runs.
 */
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has('refresh_token') || request.cookies.has('session_hint');

  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('redirect', target);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/account/:path*', '/checkout'],
};
