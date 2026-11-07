#!/usr/bin/env node
// Enforces docs/coding-standards.md: one exported component per file.
// Components are exported functions or consts whose names start uppercase.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src/components';
const EXPORT_PATTERN =
  /export\s+(?:async\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9_]*)\b/g;

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.tsx') ? [path] : [];
  });
}

const failures = [];
for (const file of walk(ROOT)) {
  const source = readFileSync(file, 'utf8');
  const names = [...new Set([...source.matchAll(EXPORT_PATTERN)].map((match) => match[1]))];
  if (names.length > 1) {
    failures.push({ file: relative('.', file), names });
  }
}

if (failures.length > 0) {
  console.error('More than one component exported from a file:');
  for (const { file, names } of failures) {
    console.error(`  ${file}: ${names.join(', ')}`);
  }
  console.error('Move each component into its own PascalCase file.');
  process.exit(1);
}

console.log(`Checked ${walk(ROOT).length} component files; one export per file.`);
