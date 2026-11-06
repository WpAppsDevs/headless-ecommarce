import { NextRequest, NextResponse } from 'next/server';

const MAX_BODY_BYTES = 16_384;

/**
 * Receives client-side error reports.
 *
 * Always writes to the server log. When ERROR_REPORT_WEBHOOK_URL is set, the
 * payload is also forwarded to that endpoint (a Slack webhook, an ingestion
 * service, or your own collector).
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, code: 'payload_too_large', message: 'Payload too large' },
        { status: 413 },
      );
    }

    let payload: unknown = raw;
    try {
      payload = JSON.parse(raw);
    } catch {
      // Keep the raw string — it is still useful in the log
    }

    console.error('[client-error]', JSON.stringify(payload));

    const webhook = process.env.ERROR_REPORT_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {
        // A failed forward must not fail the report request.
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { success: false, code: 'server_error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
