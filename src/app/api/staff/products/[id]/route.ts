import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

type Params = { params: Promise<{ id: string }> };

async function forward(
  req: NextRequest,
  id: string,
  method: 'GET' | 'PUT' | 'DELETE',
) {
  const auth = req.headers.get('Authorization');

  if (!auth) {
    return NextResponse.json(
      { success: false, code: 'no_token', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const body = method === 'GET' || method === 'DELETE' ? undefined : await req.text();

  const wpRes = await fetch(`${config.apiBase}/${config.apiNs}/staff/products/${id}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      Authorization: auth,
    },
    body,
    cache: 'no-store',
  });

  return NextResponse.json(await wpRes.json(), { status: wpRes.status });
}

function serverError() {
  return NextResponse.json(
    { success: false, code: 'server_error', message: 'Internal server error' },
    { status: 500 },
  );
}

/** GET /api/staff/products/[id] — one product for the edit form */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await forward(req, id, 'GET');
  } catch {
    return serverError();
  }
}

/** PUT /api/staff/products/[id] — update a product */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await forward(req, id, 'PUT');
  } catch {
    return serverError();
  }
}

/** DELETE /api/staff/products/[id] — move a product to the trash */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await forward(req, id, 'DELETE');
  } catch {
    return serverError();
  }
}
