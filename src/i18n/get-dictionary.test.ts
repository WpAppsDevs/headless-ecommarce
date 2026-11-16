import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/i18n/get-dictionary';
import { en } from '@/i18n/en';
import { bn } from '@/i18n/bn';

type Flat = Record<string, string>;

/** Flattens nested message groups into `group.key` paths. */
function flatten(value: unknown, prefix = ''): Flat {
  if (typeof value === 'string') return { [prefix]: value };
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Flat>(
      (all, [key, child]) => ({ ...all, ...flatten(child, prefix ? `${prefix}.${key}` : key) }),
      {},
    );
  }
  return {};
}

function keys(map: object): string[] {
  return Object.keys(flatten(map)).sort();
}

describe('getDictionary', () => {
  it('returns the english map for en', () => {
    expect(getDictionary('en')).toBe(en);
  });

  it('returns the bangla map for bn', () => {
    expect(getDictionary('bn')).toBe(bn);
  });
});

describe('dictionary parity', () => {
  it('has the same keys in both languages, so no translation can silently fall back', () => {
    expect(keys(bn)).toEqual(keys(en));
  });

  it('has no empty message', () => {
    for (const [path, message] of Object.entries({ ...flatten(en), ...flatten(bn) })) {
      expect(message.trim(), path).not.toBe('');
    }
  });

  it('keeps every interpolation placeholder in the bangla message', () => {
    const placeholders = (message: string) => (message.match(/\{\w+\}/g) ?? []).sort();
    const english = flatten(en);
    const bangla = flatten(bn);

    for (const path of Object.keys(english)) {
      expect(placeholders(bangla[path]), path).toEqual(placeholders(english[path]));
    }
  });
});
