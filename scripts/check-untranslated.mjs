#!/usr/bin/env node
/**
 * Fails on two things a type checker cannot see.
 *
 * 1. Untranslated JSX text — a literal like `>Shipping Details<` in a component.
 *    Every user-visible string belongs in src/i18n/{en,bn}.ts; a literal ships
 *    English to a Bangla visitor and no gate notices.
 *
 * 2. A <form> without method="post" — the browser performs a native GET when
 *    React has not hydrated yet, which puts the fields' values in the query
 *    string, the history and the access log.
 *
 * Both are allowlisted where an English literal is correct: the English halves
 * of the policy pages, and the two special pages that render outside a route.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/**
 * Literal attributes that are the shop's own name. A brand is not translated,
 * and `title="Najifa's Shop"` on a logo is correct in both languages.
 */
const PROPER_NOUNS = new Set(["Najifa's Shop", "Najifa's Shop — Pakistani Collection"]);

/** Files whose English literals are deliberate, with the reason. */
const TEXT_ALLOW = new Map([
  ['src/app/(storefront)/shipping/content/En.tsx', 'English half of a bilingual page'],
  ['src/app/(storefront)/returns/content/En.tsx', 'English half of a bilingual page'],
  ['src/app/(storefront)/terms/content/En.tsx', 'English half of a bilingual page'],
  ['src/app/(storefront)/privacy-policy/content/En.tsx', 'English half of a bilingual page'],
  ['src/app/(storefront)/track-order/content/En.tsx', 'English half of a bilingual page'],
  ['src/app/(storefront)/contact/content/ContactBeforeEn.tsx', 'English half of a bilingual page'],
  ['src/app/(storefront)/contact/content/ContactIntroEn.tsx', 'English half of a bilingual page'],
]);

/** Two or more Latin words inside a JSX text node. */
const JSX_TEXT = />\s*([A-Z][A-Za-z'’-]*(?:\s+[A-Za-z0-9'’-]+)+)\s*</g;

/**
 * Latin text inside an accessibility or tooltip attribute. These reach a visitor
 * through a screen reader or a hover, so English there is the same defect as
 * English in a heading — and the JSX-text pattern cannot see them.
 */
const ATTR_TEXT = /\b(?:aria-label|title|placeholder|alt)="([A-Za-z][^"]{6,})"/g;

/** A form element, to check it declares a method. */
const FORM_TAG = /<form\b([^>]*)>/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) out.push(full);
  }
  return out;
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

const failures = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, 'utf8');

  if (!TEXT_ALLOW.has(rel)) {
    for (const match of source.matchAll(JSX_TEXT)) {
      failures.push(
        `${rel}:${lineOf(source, match.index)}  untranslated text "${match[1].trim()}" — move it to src/i18n or add the file to TEXT_ALLOW`,
      );
    }

    for (const match of source.matchAll(ATTR_TEXT)) {
      if (!/[A-Za-z]\s+[A-Za-z]/.test(match[1])) continue;
      if (PROPER_NOUNS.has(match[1])) continue;
      failures.push(
        `${rel}:${lineOf(source, match.index)}  untranslated attribute "${match[1]}" — a screen reader and a tooltip both say it`,
      );
    }
  }

  for (const match of source.matchAll(FORM_TAG)) {
    if (!/method\s*=\s*["']post["']/.test(match[1])) {
      failures.push(
        `${rel}:${lineOf(source, match.index)}  <form> without method="post" — a native submit would put its values in the URL`,
      );
    }
  }
}

if (failures.length) {
  console.error('Untranslated text / unsafe form check failed:\n');
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(`\n${failures.length} problem(s).`);
  process.exit(1);
}

console.log('Untranslated text and form-method check passed.');
