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

  const { pathname, search } = request.nextUrl;

  // The staff dashboard has its own door, so a signed-out visitor goes to the
  // staff sign-in rather than the customer login page.
  if (pathname.startsWith('/studio')) {
    if (pathname.startsWith('/studio/login')) return NextResponse.next();
    if (hasSession) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = '/studio/login';
    url.search = '';

    return NextResponse.redirect(url);
  }

  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  const target = `${pathname}${search}`;
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('redirect', target);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/account/:path*', '/checkout', '/studio/:path*'],
};
