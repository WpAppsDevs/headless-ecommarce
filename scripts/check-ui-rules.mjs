#!/usr/bin/env node
// Enforces the mechanical parts of docs/coding-standards.md and
// docs/design-system.md that the type checker and ESLint cannot see. Every rule
// here is one a reviewer had to catch by hand on the account work, after the
// code was already written:
//
//   1. a <form> must use react-hook-form (coding-standards: forms);
//   2. API payloads are normalised, never cast (coding-standards: no `as`);
//   3. a component file stays near 300 lines (coding-standards: file length);
//   4. sticky offsets come from the scale, not a pixel literal
//      (design-system: `top-24` clears the header);
//   5. a request path carries no leading slash and no `config.apiBase`
//      (data-layer: the base is joined once, in apiClient).
//
// Re-run with `npm run check:ui-rules`. Add an exception only with a reason,
// never a bare path.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS = 'src/components';
const APP = 'src/app';

/**
 * Ratchet: files that predate this check and are still over the limit. None of
 * these is fine; each is a split waiting to happen, recorded in known-gaps.md.
 * The check fails any file that is not on this list, so the list only shrinks.
 */
const LONG_FILE_ALLOW = new Map([
  ['src/components/checkout/CheckoutForm.tsx', 'documented exception in coding-standards.md'],
  ['src/components/account/OrderDetailsModal.tsx', 'pre-existing; split when next touched'],
  ['src/components/product/VariationSelector.tsx', 'pre-existing; split when next touched'],
  ['src/components/shop/ShopSidebar.tsx', 'pre-existing; split when next touched'],
]);

/**
 * The same ratchet for forms that still hold their fields in `useState`.
 * The standard is react-hook-form + zod; these predate it.
 */
const FORM_ALLOW = new Map([
  ['src/components/home/ComingSoonSection.tsx', 'pre-existing newsletter form'],
  ['src/components/layout/FooterNewsletterForm.tsx', 'pre-existing newsletter form'],
  ['src/components/layout/Header.tsx', 'pre-existing search field'],
  ['src/components/tracking/TrackingForm.tsx', 'pre-existing lookup form'],
]);

/** Types that arrive as JSON from the API and must be validated, not asserted. */
const FORBIDDEN_CASTS = ['as UserProfile', 'as AuthUser'];

const MAX_LINES = 300;

/**
 * Rule 5 guards `apiClient` only. It joins `config.apiBase` itself, so a path
 * that already carries a leading slash (or repeats the base) produced
 * `…/wp-json//api/…` — a WordPress 404 that looked like a missing plugin and
 * cost three rounds of diagnosis.
 *
 * `staffFetch` is deliberately excluded: it calls this site's own
 * `/api/staff/*` proxy, so its leading slash is correct.
 */
const API_CLIENT_PATH = /\bapiClient\(\s*[`'"](?:\$\{config\.apiBase\}|\/)/;


function walk(dir, extension = '.tsx') {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path, extension) : path.endsWith(extension) ? [path] : [];
  });
}

/** Every `.ts` under `dir`, skipping the proxy handlers that build the base. */
function walkExcluding(dir, excluded) {
  return walk(dir, '.ts').filter((file) => !excluded.some((prefix) => file.startsWith(prefix) && file !== dir));
}

const files = walk(COMPONENTS);
const problems = [];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n').length;

  if (source.includes('<form') && !source.includes('useForm') && !FORM_ALLOW.has(file)) {
    problems.push(
      `${file}: <form> without react-hook-form. Use useForm + zodResolver; a GET-only form goes in FORM_ALLOW with a reason.`,
    );
  }

  for (const cast of FORBIDDEN_CASTS) {
    if (source.includes(cast)) {
      problems.push(
        `${file}: '${cast}' asserts an untrusted payload. Use normalizeUserProfile() or a type guard.`,
      );
    }
  }

  if (lines > MAX_LINES && !LONG_FILE_ALLOW.has(file)) {
    problems.push(
      `${file}: ${lines} lines (limit ${MAX_LINES}). Split it, or add a reason to LONG_FILE_ALLOW here.`,
    );
  }

  if (/sticky[^"]*\btop-\[/.test(source)) {
    problems.push(
      `${file}: pixel sticky offset. Use top-24 to clear the 68px header (design-system.md).`,
    );
  }
}

/**
 * App route files are not components, but the sticky rule and the cast rule
 * apply to them too; forms there are rare but the same rule holds.
 */
/**
 * The path rule for every non-proxy source file. `src/app/api/**` is the proxy
 * layer and must keep its explicit base.
 */
for (const file of walkExcluding('src/lib', ['src/app/api'])) {
  // Comments are stripped first: `client.ts` documents this exact bug, and the
  // doc line would otherwise trip its own rule.
  const source = readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => !/^\s*(?:\/\/|\*|\/\*)/.test(line))
    .join('\n');

  if (API_CLIENT_PATH.test(source)) {
    problems.push(
      `${file}: request path starts with '/' or repeats config.apiBase. Pass a bare path ('api/x'); the base is joined once.`,
    );
  }
}

for (const file of walk(APP)) {
  const source = readFileSync(file, 'utf8');
  for (const cast of FORBIDDEN_CASTS) {
    if (source.includes(cast)) {
      problems.push(`${file}: '${cast}' asserts an untrusted payload. Validate it instead.`);
    }
  }
  if (/sticky[^"]*\btop-\[/.test(source)) {
    problems.push(`${file}: pixel sticky offset. Use top-24 (design-system.md).`);
  }
}

if (problems.length) {
  console.error(`UI rules: ${problems.length} problem(s).\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`UI rules passed: ${files.length} component files checked.`);
