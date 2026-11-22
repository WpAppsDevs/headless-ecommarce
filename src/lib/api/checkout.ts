import { apiClient, tokenCache } from './client';
import { config } from '@/lib/config';
import { ApiError } from '@/lib/errors';
import { normalizeUserProfile } from '@/lib/user-profile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AddressFields {
  first_name: string;
  last_name?: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface BillingAddress extends AddressFields {
  email: string;
  phone: string;
}

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  /** WordPress role slugs, e.g. `['customer']` or `['customer', 'ns_staff']`. */
  roles: string[];
  billing: BillingAddress;
  shipping: AddressFields;
}

export interface PlaceOrderPayload {
  gateway: 'stripe' | 'bacs';
  payment_data?: Record<string, string>;
  billing: Record<string, string>;
  shipping?: Record<string, string>;
  shipping_method?: string;
  shipping_cost?: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  cost: string;
  description?: string;
}

export interface OrderResult {
  order_id: number;
  status: string;
  transaction_id: string | null;
}

export interface Country {
  code: string;
  name: string;
  states: Array<{ code: string; name: string }>;
}

/** Address fields PUT /api/user accepts. Every key is optional: send only what changed. */
export interface AddressUpdate {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  /** Billing only — WooCommerce keeps contact details on the billing address. */
  email?: string;
  phone?: string;
}

export interface ProfileUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  billing?: AddressUpdate;
  shipping?: AddressUpdate;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /wp-json/api/user — requires user access token */
export async function getUser(): Promise<UserProfile> {
  if (typeof window !== 'undefined') {
    // Browser: proxy through /api/auth/me to avoid CORS with external API
    const token = tokenCache.get();
    if (!token) throw new ApiError('no_token', 'Not authenticated');
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const json = (await res.json()) as {
      success: boolean;
      data?: UserProfile;
      code?: string;
      message?: string;
    };
    if (!json.success) {
      throw new ApiError(json.code ?? 'api_error', json.message ?? 'Failed to load user');
    }
    return requireProfile(json.data);
  }
  return apiClient<UserProfile>(`${config.apiNs}/user`);
}

/**
 * PUT /wp-json/api/user — requires user access token.
 *
 * The WordPress plugin already accepts the profile and both addresses on this
 * route, so account editing is real, not a support-request stand-in.
 */
function requireProfile(value: unknown): UserProfile {
  const profile = normalizeUserProfile(value);
  if (!profile) {
    throw new ApiError('invalid_response', 'The profile response was not a profile');
  }
  return profile;
}

export async function updateProfile(payload: ProfileUpdate): Promise<UserProfile> {
  const token = tokenCache.get();
  if (!token) throw new ApiError('no_token', 'Not authenticated');

  const res = await fetch('/api/account/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: UserProfile;
    code?: string;
    message?: string;
  };

  if (!json.success) {
    throw new ApiError(json.code ?? 'api_error', json.message ?? 'Failed to update profile');
  }

  return requireProfile(json.data);
}

/** POST /wp-json/api/user/password — requires user access token */
export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  const token = tokenCache.get();
  if (!token) throw new ApiError('no_token', 'Not authenticated');

  const res = await fetch('/api/account/password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: { access_token?: string };
    code?: string;
    message?: string;
  };

  if (!json.success) {
    throw new ApiError(json.code ?? 'api_error', json.message ?? 'Failed to change password');
  }

  /**
   * The change revoked every token issued before it, including the one in the
   * cache. The proxy stored the replacement pair in the cookies; the in-memory
   * cache needs the access token, or the next request goes out with a token the
   * middleware now rejects.
   */
  if (json.data?.access_token) tokenCache.set(json.data.access_token);
}

/** POST /wp-json/api/checkout — requires user access token */
export async function placeOrder(payload: PlaceOrderPayload): Promise<OrderResult> {
  if (typeof window !== 'undefined') {
    // Browser: proxy through /api/checkout to avoid CORS preflight issues
    const token = tokenCache.get();
    if (!token) throw new ApiError('no_token', 'Not authenticated');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as {
      success: boolean;
      data?: OrderResult;
      code?: string;
      message?: string;
    };
    if (!json.success) {
      throw new ApiError(json.code ?? 'api_error', json.message ?? 'Checkout failed');
    }
    return json.data as OrderResult;
  }
  return apiClient<OrderResult>(`${config.apiNs}/checkout`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** GET /wpadhlwrapi/v1/countries — fetch available countries and states */
export async function getCountries(): Promise<Country[]> {
  return apiClient<Country[]>(`${config.productsNs}/countries`);
}
