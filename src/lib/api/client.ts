/**
 * Central API client for the WPAppsDev Headless Wrapper API.
 *
 * Usage:
 *   Server Components  → pass token from cookies(): apiClient(path, { token })
 *   Client Components  → omit token; it reads from tokenCache (set by authStore)
 */

import { config } from '@/lib/config';
import { ApiError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RequestOptions = Omit<RequestInit, 'headers'> & {
  /** Explicit bearer token. Server components pass this from cookies(). */
  token?: string;
  headers?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Token cache — kept in module scope, updated by authStore on login/refresh
// ---------------------------------------------------------------------------

let _accessToken: string | undefined;

export const tokenCache = {
  get: (): string | undefined => _accessToken,
  set: (token: string | undefined): void => {
    _accessToken = token;
  },
};

// ---------------------------------------------------------------------------
// Unauthorised callback — set by authStore to avoid circular imports
// ---------------------------------------------------------------------------

let _onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void): void {
  _onUnauthorized = cb;
}

// ---------------------------------------------------------------------------
// Singleton refresh promise — ensures only one refresh fires at a time
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Our Next.js route handler reads the httpOnly refresh_token cookie
    const res = await fetch('/api/auth/refresh', { method: 'POST' });
    if (!res.ok) return null;
    const json = await res.json();
    const newToken: string | null = json?.data?.token ?? null;
    if (newToken) tokenCache.set(newToken);
    return newToken;
  } catch {
    return null;
  } finally {
    refreshPromise = null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch with one automatic retry on network failure (500 ms delay). */
async function execute(url: string, opts: RequestInit): Promise<Response> {
  try {
    return await fetch(url, opts);
  } catch {
    await new Promise<void>((r) => setTimeout(r, 500));
    return fetch(url, opts);
  }
}

/**
 * Parse the response body.
 * Throws ApiError for `{ success: false }` shapes.
 * Returns `data` when present, otherwise the full body.
 */
async function parseBody<T>(res: Response): Promise<T> {
  const json: unknown = await res.json();
  if (
    json !== null &&
    typeof json === 'object' &&
    'success' in json &&
    (json as { success: unknown }).success === false
  ) {
    const err = json as { code?: string; message?: string };
    throw new ApiError(err.code ?? 'api_error', err.message ?? 'Request failed');
  }
  const body = json as Record<string, unknown>;
  return (body?.data ?? body) as T;
}

function buildHeaders(
  extra: Record<string, string> = {},
  token?: string,
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function apiClient<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token: explicitToken, headers = {}, ...rest } = options;

  // Server components pass the token explicitly via cookies().get(...).value
  // Client components rely on the in-memory tokenCache set by authStore
  const bearerToken =
    explicitToken ??
    (typeof window !== 'undefined' ? tokenCache.get() : undefined);

  const url = path.startsWith('http')
    ? path
    : `${config.apiBase}/${path}`;

  const makeOpts = (t?: string): RequestInit => ({
    ...rest,
    headers: buildHeaders(headers, t),
  });

  // ── First attempt ────────────────────────────────────────────────────────
  const res = await execute(url, makeOpts(bearerToken));

  // ── 401 handling (browser only — server lets the caller handle redirects) ─
  if (res.status === 401 && typeof window !== 'undefined') {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;

    if (newToken) {
      const retryRes = await execute(url, makeOpts(newToken));
      if (retryRes.status === 401) {
        _onUnauthorized?.();
        throw new ApiError('session_expired', 'Session expired. Please log in again.');
      }
      return parseBody<T>(retryRes);
    }

    _onUnauthorized?.();
    throw new ApiError('session_expired', 'Session expired. Please log in again.');
  }

  // ── Parse response ───────────────────────────────────────────────────────
  try {
    return await parseBody<T>(res);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('http_error', `HTTP ${res.status}`);
  }
}
