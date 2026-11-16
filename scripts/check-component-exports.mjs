#!/usr/bin/env node
// Enforces docs/coding-standards.md for every component in the repo:
//   1. one exported component per file;
//   2. a component name lives in exactly one file (two SectionHeadings made the
//      docs list two different components under one name);
//   3. every component is referenced somewhere — ProductGrid sat unimported and
//      swallowed a real fix that had been wired into it.
//
// Covers src/components, plus the long-form page bodies under
// src/app/<route>/content/, which are components too — a lowercase file there
// broke the PascalCase rule with nothing to catch it.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const ROOT = 'src/components';
const APP_ROOT = 'src/app';
const SOURCE_ROOT = 'src';
const EXPORT_PATTERN =
  /export\s+(?:async\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9_]*)\b/g;

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.tsx') ? [path] : [];
  });
}

/** Page bodies are components, so the same rules apply to them. */
const appContent = walk(APP_ROOT).filter((path) => path.includes('/content/'));

/** A component's file is PascalCase; `content/en.tsx` broke that unnoticed. */
const lowercaseBodyFiles = appContent.filter(
  (path) => !/^[A-Z][A-Za-z0-9]*$/.test(basename(path, '.tsx')),
);

const files = [...walk(ROOT), ...appContent];
const multiExport = [];
const owners = new Map();

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const names = [...new Set([...source.matchAll(EXPORT_PATTERN)].map((match) => match[1]))];
  if (names.length > 1) {
    multiExport.push({ file: relative('.', file), names });
  }
  for (const name of names) {
    const existing = owners.get(name) ?? [];
    owners.set(name, [...existing, relative('.', file)]);
  }
}

const collisions = [...owners.entries()].filter(([, paths]) => paths.length > 1);

const sources = walk(SOURCE_ROOT)
  .filter((path) => /\.(tsx|ts)$/.test(path))
  .map((path) => [path, readFileSync(path, 'utf8')]);

const unused = [...owners.entries()]
  .filter(([name, paths]) =>
    !sources.some(
      ([path, source]) =>
        !paths.includes(relative('.', path)) &&
        new RegExp(`\\b${name}\\b`).test(source),
    ),
  )
  .map(([name, paths]) => `${paths[0]} (${name})`);

const failed =
  multiExport.length > 0 ||
  collisions.length > 0 ||
  unused.length > 0 ||
  lowercaseBodyFiles.length > 0;

if (multiExport.length > 0) {
  console.error('More than one component exported from a file:');
  for (const { file, names } of multiExport) console.error(`  ${file}: ${names.join(', ')}`);
  console.error('Move each component into its own PascalCase file.\n');
}

if (collisions.length > 0) {
  console.error('Component name used by more than one file:');
  for (const [name, paths] of collisions) console.error(`  ${name}: ${paths.join(', ')}`);
  console.error('Rename one; two components sharing a name cannot be told apart in a review.\n');
}

if (lowercaseBodyFiles.length > 0) {
  console.error('Page-body component file is not PascalCase:');
  for (const path of lowercaseBodyFiles) console.error(`  ${relative('.', path)}`);
  console.error('Rename it to match the component it exports (content/En.tsx, not content/en.tsx).\n');
}

if (unused.length > 0) {
  console.error('Component never referenced outside its own file:');
  for (const entry of unused) console.error(`  ${entry}`);
  console.error('Delete it, or wire it in — dead code silently absorbs changes.\n');
}

if (failed) process.exit(1);

console.log(
  `Checked ${files.length} component files: one export each, unique names, all referenced.`,
);
