import { describe, expect, it } from 'vitest';
import { personInitials, personName } from './user-name';

describe('personName', () => {
  it('joins the name parts', () => {
    expect(personName({ first_name: 'Sadia', last_name: 'Rahman' })).toBe('Sadia Rahman');
  });

  it('falls back to the display name when the parts are empty', () => {
    expect(personName({ first_name: '  ', display_name: 'sadia_r' })).toBe('sadia_r');
  });

  it('uses the caller fallback for an empty profile', () => {
    expect(personName(null, 'কাস্টমার')).toBe('কাস্টমার');
  });
});

describe('personInitials', () => {
  it('takes one letter from each name part', () => {
    expect(personInitials({ first_name: 'Sadia', last_name: 'Rahman' })).toBe('SR');
  });

  it('takes at most two letters', () => {
    expect(personInitials({ display_name: 'Sadia Nur Rahman' })).toBe('SN');
  });

  it('handles a single name and a Bangla name', () => {
    expect(personInitials({ first_name: 'Sadia' })).toBe('S');
    expect(personInitials({ first_name: 'সাদিয়া', last_name: 'রহমান' })).toBe('সর');
  });

  it('returns the fallback for an empty profile', () => {
    expect(personInitials(null)).toBe('·');
  });
});
