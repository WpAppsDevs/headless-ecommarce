export const SESSION_HINT_COOKIE = 'session_hint';

/**
 * The session hint is a readable, non-secret boolean cookie set by the auth
 * routes. It tells the client whether an httpOnly refresh token may exist.
 */
export function hasSessionHint(cookieString: string): boolean {
  return cookieString
    .split('; ')
    .includes(`${SESSION_HINT_COOKIE}=1`);
}

export function shouldAttemptAuthHydration(input: {
  hasGuestCart: boolean;
  hasTokenCache: boolean;
  cookieString: string;
}): boolean {
  return (
    input.hasGuestCart ||
    input.hasTokenCache ||
    hasSessionHint(input.cookieString)
  );
}
