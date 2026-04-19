import { apiClient, tokenCache } from './client';
import { config } from '@/lib/config';
import { ApiError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AddressFields {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
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
  billing: BillingAddress;
  shipping: AddressFields;
}

export interface PlaceOrderPayload {
  gateway: 'stripe' | 'bacs';
  payment_data?: Record<string, string>;
  billing: Record<string, string>;
  shipping?: Record<string, string>;
}

export interface OrderResult {
  order_id: number;
  status: string;
  transaction_id: string | null;
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
    return json.data as UserProfile;
  }
  return apiClient<UserProfile>(`${config.apiNs}/user`);
}

/** POST /wp-json/api/checkout — requires user access token */
export async function placeOrder(payload: PlaceOrderPayload): Promise<OrderResult> {
  return apiClient<OrderResult>(`${config.apiNs}/checkout`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
