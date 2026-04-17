import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** Returns the current user profile using the access_token passed in the
 *  Authorization header. Called by authStore.hydrate() on page load. */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'No token provided' },
        { status: 401 },
      );
    }

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/user`, {
      headers: { Authorization: authHeader },
    });

    const json = await wpRes.json();

    if (!wpRes.ok || json?.success === false) {
      return NextResponse.json(json, { status: wpRes.status });
    }

    return NextResponse.json({ success: true, data: json.data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
