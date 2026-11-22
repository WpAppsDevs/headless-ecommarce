import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight route guard for pages that need a session.
 *
 * This checks cookie presence only. WordPress still authorizes every data
 * request, and the role-based landing happens in the client once the profile
 * (which carries the user's roles) is known. This exists so anonymous visitors
 * do not see the account, checkout or studio shell before the client-side
 * redirect runs.
 */
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has('refresh_token') || request.cookies.has('session_hint');

  const { pathname, search } = request.nextUrl;

  // The old staff door. One login serves everybody now, and the role decides
  // the landing, so this always goes to `/login` and asks for `/studio`.
  if (pathname.startsWith('/studio/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('redirect', '/studio');

    return NextResponse.redirect(url);
  }

  // The staff dashboard shares the one login; a signed-out visitor is sent
  // back to it with the studio path as the landing.
  if (pathname.startsWith('/studio')) {
    if (hasSession) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('redirect', `${pathname}${search}`);

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
