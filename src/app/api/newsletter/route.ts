import { NextResponse } from 'next/server';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY ?? '';
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID ?? '';
// Derive datacenter from API key (e.g. "us21" from "xxx-us21")
const MAILCHIMP_DC = MAILCHIMP_API_KEY.split('-').pop() ?? '';

export async function POST(req: Request) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    return NextResponse.json(
      { error: 'Newsletter service is not configured.' },
      { status: 503 },
    );
  }

  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 });
  }

  const url = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
    }),
  });

  const data = await res.json();

  // 200 = new subscriber, 400 with title "Member Exists" = already subscribed
  if (res.ok) {
    return NextResponse.json({ success: true });
  }

  if (data?.title === 'Member Exists') {
    return NextResponse.json({ success: true, alreadySubscribed: true });
  }

  return NextResponse.json(
    { error: data?.detail ?? 'Something went wrong. Please try again.' },
    { status: 500 },
  );
}
