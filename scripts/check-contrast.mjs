import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(projectRoot, 'src/app/globals.css'), 'utf8');

const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/);
if (!rootBlock) {
  console.error('Could not find the :root block in src/app/globals.css');
  process.exit(1);
}

const tokens = new Map();
for (const match of rootBlock[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
  tokens.set(match[1], match[2].trim());
}

function token(name) {
  const value = tokens.get(name);
  if (!value) {
    console.error(`Missing token --${name} in the :root block`);
    process.exit(1);
  }
  const reference = value.match(/^var\(--([\w-]+)\)$/);
  if (reference) return token(reference[1]);
  if (!/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    console.error(`Token --${name} does not resolve to a hex colour: ${value}`);
    process.exit(1);
  }
  return value;
}

function channel(value) {
  const hex = value.replace('#', '');
  const normalized = hex.length === 3
    ? hex.split('').map((char) => char + char).join('')
    : hex;
  const rgb = normalized.slice(0, 6);
  return [0, 2, 4].map((index) => parseInt(rgb.slice(index, index + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = channel(hex).map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

const checks = [
  ['White on the strong accent', '#FFFFFF', token('brand-accent-strong'), 4.5],
  ['White on the strong accent hover', '#FFFFFF', token('brand-accent-strong-hover'), 4.5],
  ['White on wine', '#FFFFFF', token('brand-wine'), 4.5],
  ['Strong accent on the page background', token('brand-accent-strong'), token('brand-bg'), 4.5],
  ['Strong accent on a card', token('brand-accent-strong'), token('brand-card'), 4.5],
  ['Strong accent on the soft accent tint', token('brand-accent-strong'), token('brand-accent-light'), 4.5],
  ['Primary foreground on the primary action', token('primary-foreground'), token('primary'), 4.5],
  ['Primary action on the page background', token('primary'), token('brand-bg'), 4.5],
  ['Focus ring on the page background', token('ring'), token('brand-bg'), 3.0],
  ['Focus ring on a section', token('ring'), token('brand-section'), 3.0],
  ['Brand text on the page background', token('brand-text'), token('brand-bg'), 4.5],
  ['Brand text on a card', token('brand-text'), token('brand-card'), 4.5],
  ['Muted text on the page background', token('brand-text-muted'), token('brand-bg'), 4.5],
  ['Muted text on a card', token('brand-text-muted'), token('brand-card'), 4.5],
  ['Brand text on the topbar', token('brand-text'), token('brand-topbar'), 4.5],
  ['Stock on the page background', token('brand-stock'), token('brand-bg'), 4.5],
  ['Stock on a section', token('brand-stock'), token('brand-section'), 4.5],
  ['Stock on a card', token('brand-stock'), token('brand-card'), 4.5],
  ['Pre-order on the page background', token('brand-preorder'), token('brand-bg'), 4.5],
  ['Pre-order on a section', token('brand-preorder'), token('brand-section'), 4.5],
  ['Pre-order on a card', token('brand-preorder'), token('brand-card'), 4.5],
  ['White on WhatsApp', '#FFFFFF', token('brand-whatsapp'), 4.5],
  ['WhatsApp on white', token('brand-whatsapp'), '#FFFFFF', 4.5],
  ['Strong gold on a card', token('brand-gold-strong'), token('brand-card'), 3.0],
  ['Soft accent on the dark surface', token('brand-accent'), token('brand-dark-surface'), 4.5],
  ['Gold on the dark surface', token('brand-gold'), token('brand-dark-surface'), 4.5],
  ['White on the dark surface', '#FFFFFF', token('brand-dark-surface'), 4.5],
];

let failed = false;
for (const [label, foreground, background, minimum] of checks) {
  const ratio = contrast(foreground, background);
  const passes = ratio >= minimum;
  if (!passes) failed = true;
  console.log(`${passes ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1  ${label}`);
}

const strongAccent = token('brand-accent-strong').toLowerCase();
for (const name of ['primary', 'ring']) {
  const mapped = token(name).toLowerCase() === strongAccent;
  if (!mapped) failed = true;
  console.log(`${mapped ? 'PASS' : 'FAIL'}  --${name} resolves to the strong accent`);
}

if (failed) {
  console.error('\nContrast check failed. Adjust the tokens before shipping.');
  process.exit(1);
}

console.log(`\nAll ${checks.length} contrast pairs pass.`);
