import { create } from 'zustand';
import { tokenCache, setOnUnauthorized } from '@/lib/api/client';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useReviewStore } from '@/stores/reviewStore';
import { shouldAttemptAuthHydration } from '@/lib/auth-session';
import { normalizeUserProfile } from '@/lib/user-profile';
import { normalizeRoles } from '@/lib/roles';
import { personName } from '@/lib/user-name';
import type { UserProfile } from '@/lib/api/checkout';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  /** WordPress role slugs; drives which dashboard the person lands on. */
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  /**
   * Full profile, including both addresses. Hydration already receives it, so
   * the account page reads it from here instead of fetching the same payload a
   * second time. Null until a load or an update fills it.
   */
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  hydrated: boolean;
  login: (username: string, password: string, guestToken?: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  /** Re-hydrate auth state on page load (call once from root layout). */
  hydrate: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clearGuestToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart_token');
  }
}

async function postJson(url: string, body: Record<string, unknown>) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * The identity the header and the role routing need, from an untrusted login
 * payload. The full profile (addresses) arrives on refresh.
 */
function toAuthUser(value: unknown): AuthUser | null {
  if (typeof value !== 'object' || value === null) return null;

  const raw = value as Record<string, unknown>;
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    email: typeof raw.email === 'string' ? raw.email : '',
    display_name: typeof raw.display_name === 'string' ? raw.display_name : '',
    roles: normalizeRoles(raw.roles),
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set) => {
  // Register the onUnauthorized handler (browser only).
  // Called by apiClient when a 401 persists after a token refresh attempt.
  if (typeof window !== 'undefined') {
    setOnUnauthorized(() => {
      // A bearer token in the cache means a real user session expired.
      // Otherwise the 401 came from a guest cart token (no refresh cookie),
      // which must NOT force a login redirect — that caused an infinite
      // redirect loop on /login when a stale cart_token lingered in
      // localStorage and CartHydrator re-fetched it on every page load.
      const hadSession = !!tokenCache.get();
      tokenCache.set(undefined);
      set({ user: null, profile: null, isAuthenticated: false });

      const cart = useCartStore.getState();
      cart.clearCart();
      useWishlistStore.getState().clear();

      if (!hadSession) {
        // Drop the dead guest token so hydration stops retrying it.
        cart.clearGuestToken();
        return;
      }

      // Avoid reloading the login page when we're already there. Otherwise
      // keep the current page as the landing so a studio or checkout session
      // that expires returns to where the person was.
      if (window.location.pathname !== '/login') {
        const target = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?redirect=${encodeURIComponent(target)}`);
      }
    });
  }

  return {
    user: null,
    profile: null,
    /**
     * Store the fresh profile and keep the header identity in step: the rail,
     * the greeting and the header all read the same account, so a name or email
     * saved in Settings must not leave the header showing the old one.
     */
    setProfile: (profile) =>
      set((state) => ({
        profile,
        user: profile
          ? {
              id: profile.id,
              email: profile.email,
              display_name: personName(profile, state.user?.display_name ?? ''),
              roles: normalizeRoles(profile.roles),
            }
          : state.user,
      })),
    isAuthenticated: false,
    loading: false,
    hydrated: false,

    // ── login ───────────────────────────────────────────────────────────────
    login: async (username, password, guestToken) => {
      set({ loading: true });
      try {
        const res = await postJson('/api/auth/login', {
          username,
          password,
          ...(guestToken ? { guest_cart_token: guestToken } : {}),
        });
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.message ?? 'Login failed');
        }
        tokenCache.set(json.data.access_token);
        // Guest cart was merged into the user cart on login
        clearGuestToken();
        set({ user: toAuthUser(json.data.user), isAuthenticated: true, loading: false });
        // Refresh cart and sync guest wishlist to server in parallel
        void useCartStore.getState().fetchCart();
        void useWishlistStore.getState().syncGuestWishlist();
      } catch (e) {
        set({ loading: false });
        throw e;
      }
    },

    // ── register ────────────────────────────────────────────────────────────
    register: async (email, password, first_name, last_name) => {
      set({ loading: true });
      try {
        const res = await postJson('/api/auth/register', {
          email,
          password,
          first_name,
          last_name,
        });
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.message ?? 'Registration failed');
        }
        tokenCache.set(json.data.access_token);
        clearGuestToken();
        set({ user: toAuthUser(json.data.user), isAuthenticated: true, loading: false });
        void useCartStore.getState().fetchCart();
        void useWishlistStore.getState().syncGuestWishlist();
      } catch (e) {
        set({ loading: false });
        throw e;
      }
    },

    // ── logout ──────────────────────────────────────────────────────────────
    logout: async () => {
      tokenCache.set(undefined);
      // Fire-and-forget — clear httpOnly cookies server-side
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      set({ user: null, profile: null, isAuthenticated: false });
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clear();
      useReviewStore.getState().clear();
    },

    // ── refreshToken ────────────────────────────────────────────────────────
    refreshToken: async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.token) {
          tokenCache.set(json.data.token);
        }
      } catch {
        // Silently fail — apiClient handles the 401 retry independently
      }
    },

    // ── hydrate ─────────────────────────────────────────────────────────────
    // Called once on mount in the root layout to restore auth state after
    // a page reload (access_token lives in httpOnly cookie, not memory).
    hydrate: async () => {
      try {
        // The refresh token is httpOnly, so the client cannot inspect it.
        // `session_hint` is a readable, non-secret companion cookie set on
        // login/register/refresh. It answers only "is a session worth trying?"
        const hasGuestCart =
          typeof window !== 'undefined' && localStorage.getItem('cart_token');
        const hasTokenCache = tokenCache.get();
        const cookieString = typeof document !== 'undefined' ? document.cookie : '';

        if (
          !shouldAttemptAuthHydration({
            hasGuestCart: !!hasGuestCart,
            hasTokenCache: !!hasTokenCache,
            cookieString,
          })
        ) {
          set({ hydrated: true });
          return;
        }

        // Try to get a fresh access_token via the refresh_token cookie
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!refreshRes.ok) return; // Not authenticated — stay logged out

        const refreshJson = await refreshRes.json();
        const newToken: string | undefined = refreshJson.data?.token;
        if (!newToken) return;

        tokenCache.set(newToken);

        /**
         * The refresh route returns the profile on the same hop, and it fetches
         * it from WordPress when an older plugin omits it. That is why there is
         * no second `/api/auth/me` call here: the route already made it.
         */
        const profile = normalizeUserProfile(refreshJson.data?.profile);
        if (!profile) return;

        set({
          user: {
            id: profile.id,
            email: profile.email,
            display_name: personName(profile, profile.email),
            roles: normalizeRoles(profile.roles),
          },
          profile,
          isAuthenticated: true,
        });
      } catch {
        // Not authenticated — keep default state
      } finally {
        // Always mark hydration complete so dependent pages can proceed
        set({ hydrated: true });
      }
    },
  };
});
