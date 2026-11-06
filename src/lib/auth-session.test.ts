import { describe, expect, it } from 'vitest';
import { hasSessionHint, shouldAttemptAuthHydration } from './auth-session';

describe('session hint', () => {
  it('finds the hint among other cookies', () => {
    expect(hasSessionHint('a=1; session_hint=1; b=2')).toBe(true);
    expect(hasSessionHint('session_hint=0')).toBe(false);
    expect(hasSessionHint('')).toBe(false);
  });

  it('attempts hydration when any session signal exists', () => {
    expect(
      shouldAttemptAuthHydration({
        hasGuestCart: false,
        hasTokenCache: false,
        cookieString: 'session_hint=1',
      }),
    ).toBe(true);

    expect(
      shouldAttemptAuthHydration({
        hasGuestCart: false,
        hasTokenCache: false,
        cookieString: '',
      }),
    ).toBe(false);
  });
});
