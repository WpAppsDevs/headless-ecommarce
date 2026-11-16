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
 */
const CASES = [
  { route: '/', cookie: '', lang: 'en', body: 'Delivery in 15–25 Days' },
  { route: '/', cookie: 'locale=bn', lang: 'bn', body: '১৫–২৫ দিনে ডেলিভারি' },
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

async function check() {
  const failures = [];

  for (const { route, cookie, lang: expectedLang, title, body } of CASES) {
    const label = `${route} (${cookie || 'no cookie'})`;
    const response = await fetch(BASE + route, {
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
