#!/usr/bin/env node
// Enforces docs/design-system.md: brand colour in a component comes from a token.
//
// The drift vector is a Tailwind arbitrary colour class such as bg-[#9E2F45]. It
// looks like styling, but it is a literal no palette change can reach — the audit
// that started the Cobalt & Paper change found 42 of them doing exactly that.
// Third-party brand marks are not ours to tokenise, so they are listed here.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src';
const SOURCE = /\.(tsx|ts)$/;
const HEX_CLASS = /-\[#[0-9a-fA-F]{3,8}\]/g;

/** [file, allowed arbitrary hex values] — nothing else is exempt. */
const ALLOWED = [
  ['src/components/layout/Footer.tsx', /\[#(1A1F71|EB001B|F79E1B|2E77BC)\]/],
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path);
    return SOURCE.test(path) ? [path] : [];
  });
}

const failures = [];

for (const file of walk(ROOT)) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');
  const exemption = ALLOWED.find(([allowedFile]) => allowedFile === file)?.[1];

  lines.forEach((line, index) => {
    const matches = line.match(HEX_CLASS);
    if (!matches) return;
    const offenders = matches.filter((match) => !(exemption && exemption.test(match)));
    if (offenders.length === 0) return;
    failures.push({ file: relative('.', file), line: index + 1, offenders });
  });
}

if (failures.length > 0) {
  for (const { file, line, offenders } of failures) {
    console.error(`${file}:${line}  arbitrary colour ${offenders.join(' ')}`);
  }
  console.error(
    `\n${failures.length} arbitrary colour class(es). Add a token to :root and @theme inline in\n` +
      'src/app/globals.css, or add the file to ALLOWED in scripts/check-tokens.mjs when the\n' +
      'colour belongs to a third party.',
  );
  process.exit(1);
}

console.log('No arbitrary colour classes; every colour comes from a token.');
