import { describe, expect, it } from 'vitest';
import { staffAccessOutcome } from '@/lib/staff-access-outcome';

describe('staffAccessOutcome', () => {
  it('treats a missing error as granted', () => {
    expect(staffAccessOutcome(undefined)).toBe('granted');
    expect(staffAccessOutcome(null)).toBe('granted');
  });

  it('treats a customer or other role as denied', () => {
    expect(staffAccessOutcome('forbidden')).toBe('denied');
  });

  it('treats a missing or expired session as expired, not as no access', () => {
    expect(staffAccessOutcome('no_token')).toBe('expired');
    expect(staffAccessOutcome('missing_token')).toBe('expired');
    expect(staffAccessOutcome('invalid_token')).toBe('expired');
  });

  it('treats a missing staff route as an unavailable backend, not a bad password', () => {
    // The production plugin returned 404 rest_no_route while the storefront was
    // already deployed; reporting that as "sign in failed" sent the user to the
    // password field for a server problem.
    expect(staffAccessOutcome('rest_no_route')).toBe('unavailable');
    expect(staffAccessOutcome('http_error')).toBe('unavailable');
    expect(staffAccessOutcome('server_error')).toBe('unavailable');
  });
});
