import { describe, expect, it } from 'vitest';
import { resolveApiUrl } from '@/lib/api/client';

describe('resolveApiUrl', () => {
  it('joins a namespace path onto the WordPress base', () => {
    expect(resolveApiUrl('wpadhlwrapi/v1/products')).toBe(
      'http://wordpress.test/wp-json/wpadhlwrapi/v1/products',
    );
  });

  it('does not double the slash for a leading-slash path', () => {
    // This exact shape returned 404 rest_no_route from WordPress.
    expect(resolveApiUrl('/api/staff/access')).toBe(
      'http://wordpress.test/wp-json/api/staff/access',
    );
  });

  it('leaves an absolute URL alone', () => {
    expect(resolveApiUrl('https://example.test/x')).toBe('https://example.test/x');
  });
});
