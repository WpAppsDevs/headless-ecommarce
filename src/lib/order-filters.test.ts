import { describe, expect, it } from 'vitest';
import { ORDER_FILTERS, statusForFilter } from './order-filters';

describe('order filters', () => {
  it('asks for every order only when the filter is all', () => {
    expect(statusForFilter('all')).toBeUndefined();
  });

  it('maps every other filter to a real WooCommerce status', () => {
    const statuses = ORDER_FILTERS.filter((filter) => filter.id !== 'all').map((filter) => {
      expect(filter.status).toBeTruthy();
      return filter.status;
    });
    expect(new Set(statuses).size).toBe(statuses.length);
  });

  it('sends the status the plugin knows, not the UI label', () => {
    expect(statusForFilter('delivery')).toBe('delivery');
    expect(statusForFilter('cancelled')).toBe('cancelled');
  });
});
