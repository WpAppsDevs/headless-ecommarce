import { describe, expect, it } from 'vitest';
import { normalizeUserProfile } from './user-profile';

describe('normalizeUserProfile', () => {
  it('keeps a complete profile intact', () => {
    const profile = normalizeUserProfile({
      id: 12,
      email: 'buyer@example.com',
      display_name: 'Sadia Rahman',
      first_name: 'Sadia',
      last_name: 'Rahman',
      billing: { address_1: '1 Main St', city: 'Dhaka', email: 'buyer@example.com', phone: '+880' },
      shipping: { address_1: '1 Main St', city: 'Dhaka' },
    });

    expect(profile?.id).toBe(12);
    expect(profile?.billing.phone).toBe('+880');
    expect(profile?.shipping.city).toBe('Dhaka');
  });

  it('fills missing address fields instead of throwing', () => {
    const profile = normalizeUserProfile({ id: 5 });

    expect(profile?.billing.address_1).toBe('');
    expect(profile?.shipping.country).toBe('');
    expect(profile?.email).toBe('');
  });

  it('rejects a payload with no usable id', () => {
    expect(normalizeUserProfile(null)).toBeNull();
    expect(normalizeUserProfile('nope')).toBeNull();
    expect(normalizeUserProfile({ id: 'x' })).toBeNull();
    expect(normalizeUserProfile({ id: 0 })).toBeNull();
  });
});
