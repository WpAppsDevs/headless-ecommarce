import type { AddressFields, BillingAddress, UserProfile } from '@/lib/api/checkout';

/**
 * Turn an untrusted API payload into a `UserProfile`, or nothing.
 *
 * The refresh response, `/api/auth/me` and the profile route all hand back JSON
 * the frontend never validated; casting it meant a missing field crashed a
 * screen instead of being treated as absent. This checks the shape it needs and
 * fills the rest with empty strings.
 */

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function address(value: unknown): AddressFields {
  const source = record(value) ?? {};

  return {
    first_name: text(source.first_name),
    last_name: text(source.last_name),
    company: text(source.company),
    address_1: text(source.address_1),
    address_2: text(source.address_2),
    city: text(source.city),
    state: text(source.state),
    postcode: text(source.postcode),
    country: text(source.country),
  };
}

function billingAddress(value: unknown): BillingAddress {
  const source = record(value) ?? {};

  return {
    ...address(source),
    email: text(source.email),
    phone: text(source.phone),
  };
}

export function normalizeUserProfile(value: unknown): UserProfile | null {
  const source = record(value);
  if (!source) return null;

  const id = Number(source.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    email: text(source.email),
    display_name: text(source.display_name),
    first_name: text(source.first_name),
    last_name: text(source.last_name),
    billing: billingAddress(source.billing),
    shipping: address(source.shipping),
  };
}
