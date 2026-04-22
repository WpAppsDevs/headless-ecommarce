import { create } from 'zustand';
import { tokenCache, setOnUnauthorized } from '@/lib/api/client';
import { useCartStore } from '@/stores/cartStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
}

interface AuthState {
  user: AuthUser | null;
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

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set, get) => {
  // Register the onUnauthorized handler (browser only).
  // Called by apiClient when a 401 persists after a token refresh attempt.
  if (typeof window !== 'undefined') {
    setOnUnauthorized(() => {
      tokenCache.set(undefined);
      set({ user: null, isAuthenticated: false });
      useCartStore.getState().clearCart();
      window.location.href = '/login';
    });
  }

  return {
    user: null,
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
        set({ user: json.data.user, isAuthenticated: true, loading: false });
        // Refresh cart to reflect the server-side merged state
        void useCartStore.getState().fetchCart();
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
        set({ user: json.data.user, isAuthenticated: true, loading: false });
        void useCartStore.getState().fetchCart();
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
      set({ user: null, isAuthenticated: false });
      useCartStore.getState().clearCart();
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
        // Try to get a fresh access_token via the refresh_token cookie
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!refreshRes.ok) return; // Not authenticated — stay logged out

        const refreshJson = await refreshRes.json();
        const newToken: string | undefined = refreshJson.data?.token;
        if (!newToken) return;

        tokenCache.set(newToken);

        // Fetch the user profile with the fresh token
        const userRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        if (!userRes.ok) return;

        const userJson = await userRes.json();
        if (userJson.data?.user ?? userJson.data) {
          const user: AuthUser = userJson.data?.user ?? userJson.data;
          set({ user, isAuthenticated: true });
        }
      } catch {
        // Not authenticated — keep default state
      } finally {
        // Always mark hydration complete so dependent pages can proceed
        set({ hydrated: true });
      }
    },
  };
});
