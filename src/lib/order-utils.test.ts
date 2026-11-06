import { describe, expect, it } from 'vitest';
import {
  CHECKOUT_DRAFT_STATUS,
  filterCheckoutDrafts,
  isCheckoutDraftStatus,
} from './order-utils';

describe('order utils', () => {
  it('recognises the checkout draft status exactly', () => {
    expect(isCheckoutDraftStatus(CHECKOUT_DRAFT_STATUS)).toBe(true);
    expect(isCheckoutDraftStatus('pending')).toBe(false);
    expect(isCheckoutDraftStatus(null)).toBe(false);
    expect(isCheckoutDraftStatus(undefined)).toBe(false);
  });

  it('removes checkout drafts without mutating the input', () => {
    const input = [
      { id: 1, status: 'completed' },
      { id: 2, status: CHECKOUT_DRAFT_STATUS },
      { id: 3, status: 'pending' },
    ];

    const result = filterCheckoutDrafts(input);

    expect(result.map((order) => order.id)).toEqual([1, 3]);
    expect(input).toHaveLength(3);
  });
});
