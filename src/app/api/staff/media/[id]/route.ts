import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** PATCH /api/staff/media/[id] — replace an image's alt text */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = req.headers.get('Authorization');

    if (!auth) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await req.text();

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/staff/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body,
      cache: 'no-store',
    });

    return NextResponse.json(await wpRes.json(), { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/** DELETE /api/staff/media/[id] — remove an image no product uses yet */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = req.headers.get('Authorization');

    if (!auth) {
      return NextResponse.json(
        { success: false, code: 'no_token', message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/staff/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: auth },
      cache: 'no-store',
    });

    return NextResponse.json(await wpRes.json(), { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
