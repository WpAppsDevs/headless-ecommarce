#!/usr/bin/env node
// Checks that every route renders the language it was asked for.
//
// Run after `next build`. Starts the production server on a spare port and
// asserts, per route, the <html lang> and a fragment of the page — the <title>,
// or the body for copy that lives there. This is the check that would have
// caught /track-order shipping English metadata in both locales, and the
// delivery window disagreeing between the announcement bar and /shipping.
//
// Not a visual test: it proves the server chose the right language and the right
// single source for copy, not that anything looks good.
import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT ?? 3210);
const BASE = `http://127.0.0.1:${PORT}`;

/**
 * Each case names a route, the cookie it is requested with, the language the
 * response must declare, and one fragment it must contain.
 *
 * A case with `discoverFrom` resolves its route from the catalogue first: the
 * product detail page needs a real slug, and hard-coding one would rot the day
 * that product is retired.
 */
const CASES = [
  { route: '/', cookie: '', lang: 'en', body: 'Delivery in 15–25 Days' },
  { route: '/', cookie: 'locale=bn', lang: 'bn', body: '১৫–২৫ দিনে ডেলিভারি' },
  { route: '/', cookie: '', lang: 'en', body: 'How Pre-Order Works' },
  { route: '/', cookie: 'locale=bn', lang: 'bn', body: 'প্রি-অর্ডার যেভাবে কাজ করে' },
  { route: '/', cookie: '', lang: 'en', body: 'View Product' },
  { route: '/', cookie: 'locale=bn', lang: 'bn', body: 'স্টক শেষ' },
  { route: '/products', cookie: '', lang: 'en', body: 'Default sorting' },
  { route: '/products', cookie: 'locale=bn', lang: 'bn', body: 'ডিফল্ট ক্রম' },
  { route: '/products', cookie: 'locale=bn', lang: 'bn', body: 'সব পণ্য' },
  { discoverFrom: '/products', cookie: '', lang: 'en', body: 'Product Details' },
  { discoverFrom: '/products', cookie: 'locale=bn', lang: 'bn', body: 'পণ্যের বিবরণ' },
  { discoverFrom: '/products', cookie: 'locale=bn', lang: 'bn', body: 'রিভিউ লিখতে সাইন ইন করুন' },
  { route: '/login', cookie: '', lang: 'en', title: 'Sign In' },
  { route: '/login', cookie: 'locale=bn', lang: 'bn', title: 'সাইন ইন' },
  { route: '/studio/login', cookie: '', lang: 'en', title: 'Studio Sign In' },
  { route: '/studio/login', cookie: 'locale=bn', lang: 'bn', title: 'স্টুডিও সাইন ইন' },
  { route: '/register', cookie: 'locale=bn', lang: 'bn', title: 'অ্যাকাউন্ট খোলা' },
  { route: '/forgot-password', cookie: 'locale=bn', lang: 'bn', title: 'পাসওয়ার্ড ভুলে গেছেন' },
  { route: '/cart', cookie: '', lang: 'en', title: 'Shopping Cart' },
  { route: '/cart', cookie: 'locale=bn', lang: 'bn', title: 'কার্ট' },
  { route: '/cart', cookie: 'locale=bn', lang: 'bn', body: 'আপনার কার্ট খালি' },
  { route: '/contact', cookie: '', lang: 'en', title: 'Contact Us' },
  { route: '/contact', cookie: 'locale=bn', lang: 'bn', title: 'যোগাযোগ' },
  { route: '/contact', cookie: 'locale=bn', lang: 'bn', body: 'আমাদের টিমের সঙ্গে কথা বলুন' },
  { route: '/shipping', cookie: '', lang: 'en', title: 'Shipping & Delivery' },
  { route: '/shipping', cookie: 'locale=bn', lang: 'bn', title: 'শিপিং ও ডেলিভারি' },
  { route: '/terms', cookie: '', lang: 'en', title: 'Terms of Service' },
  { route: '/terms', cookie: 'locale=bn', lang: 'bn', title: 'টার্মস অফ সার্ভিস' },
  { route: '/track-order', cookie: '', lang: 'en', title: 'Track Order' },
  { route: '/track-order', cookie: 'locale=bn', lang: 'bn', title: 'ট্র্যাক অর্ডার' },
];

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function waitForServer(deadline) {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server did not answer on ${BASE} within 30s`);
}

/**
 * Reads the first product href off a listing page, so the detail-page cases
 * follow the catalogue instead of naming a slug that may be deleted.
 */
async function discoverProductPath() {
  const response = await fetch(`${BASE}/products`, { signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const match = html.match(/href="(\/products\/[a-z0-9][^"?#]*)"/);
  if (!match) throw new Error('no product link found on /products');
  return match[1].replace(/^href="/, '').replace(/"$/, '');
}

async function check() {
  const failures = [];
  let discoveredRoute;

  for (const { route, discoverFrom, cookie, lang: expectedLang, title, body } of CASES) {
    const resolvedRoute =
      route ??
      (discoveredRoute ??= await discoverProductPath().catch((error) => {
        failures.push(`${discoverFrom}: ${error.message}`);
        return null;
      }));
    if (!resolvedRoute) continue;

    const label = `${resolvedRoute} (${cookie || 'no cookie'})`;
    const response = await fetch(BASE + resolvedRoute, {
      headers: cookie ? { cookie } : {},
      signal: AbortSignal.timeout(30000),
    });
    const html = await response.text();

    if (!response.ok) {
      failures.push(`${label}: HTTP ${response.status}`);
      continue;
    }

    const lang = html.match(/<html[^>]*\slang="([^"]*)"/)?.[1];
    if (lang !== expectedLang) {
      failures.push(`${label}: lang="${lang}", expected "${expectedLang}"`);
    }

    if (title !== undefined) {
      const actual = decodeEntities(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
      if (!actual.includes(title)) {
        failures.push(`${label}: title "${actual}" does not contain "${title}"`);
      }
    }

    if (body !== undefined) {
      const actual = decodeEntities(html);
      if (!actual.includes(body)) {
        failures.push(`${label}: body does not contain "${body}"`);
      }
    }
  }

  return failures;
}

const server = spawn('npx', ['next', 'start', '--port', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: String(PORT) },
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += String(chunk);
});
server.stderr.on('data', (chunk) => {
  serverOutput += String(chunk);
});

let exitCode = 1;

try {
  await waitForServer(Date.now() + 30000);
  const failures = await check();

  if (failures.length > 0) {
    console.error('Route render check failed:\n');
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    console.error('\nEach case is a route, the cookie it was requested with, and what came back.');
  } else {
    const routes = new Set(CASES.map((testCase) => testCase.route)).size;
    console.log(`Route render check passed: ${CASES.length} cases across ${routes} routes.`);
    exitCode = 0;
  }
} catch (error) {
  console.error(`Route render check could not run: ${error.message}`);
  if (serverOutput.trim()) console.error(`\nServer output:\n${serverOutput.trim()}`);
} finally {
  if (!server.killed) server.kill('SIGTERM');
}

process.exit(exitCode);
