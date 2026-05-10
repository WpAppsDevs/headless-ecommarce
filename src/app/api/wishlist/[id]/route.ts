import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/** DELETE /api/wishlist/[id] — remove a product from the wishlist */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = req.headers.get('Authorization');

    const wpRes = await fetch(
      `${config.apiBase}/${config.apiNs}/wishlist/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(auth ? { Authorization: auth } : {}),
        },
      },
    );

    const json = await wpRes.json();
    return NextResponse.json(json, { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
