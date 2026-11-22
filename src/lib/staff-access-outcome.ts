/**
 * What a failed staff-access check means.
 *
 * WordPress answers three different things and they must not be reported as one:
 * a customer token gets `forbidden` — "you may not use this dashboard". A
 * missing or expired token means the session ended and the person should sign
 * in again. Anything else (a 404 `rest_no_route` because the plugin on that site
 * is older, a 500, a network failure) is "the backend is not there", which no
 * password can fix.
 *
 * Kept as a pure function so the mapping is testable without a browser.
 */
export type StaffAccessOutcome = 'granted' | 'denied' | 'expired' | 'unavailable';

const SESSION_CODES = [
  'no_token',
  'missing_token',
  'invalid_token',
  'session_expired',
  'user_not_found',
];

export function staffAccessOutcome(errorCode: string | undefined | null): StaffAccessOutcome {
  if (!errorCode) return 'granted';
  if (errorCode === 'forbidden') return 'denied';
  if (SESSION_CODES.includes(errorCode)) return 'expired';

  return 'unavailable';
}
