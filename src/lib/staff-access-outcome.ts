/**
 * What a failed staff-access check means.
 *
 * WordPress answers three different things and they must not be reported as one:
 * a customer token gets `forbidden`, a missing token `no_token` — those are
 * "you may not use this dashboard". Anything else (a 404 `rest_no_route` because
 * the plugin on that site is older than 1.1.0, a 500, a network failure) is
 * "the dashboard's backend is not there", which no password can fix.
 *
 * Kept as a pure function so the mapping is testable without a browser.
 */
export type StaffAccessOutcome = 'granted' | 'denied' | 'unavailable';

export function staffAccessOutcome(errorCode: string | undefined | null): StaffAccessOutcome {
  if (!errorCode) return 'granted';
  if (errorCode === 'forbidden' || errorCode === 'no_token') return 'denied';

  return 'unavailable';
}
