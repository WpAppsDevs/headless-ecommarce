import { describe, expect, it } from 'vitest';
import { DEFAULT_SHIPPING_METHODS, getShippingMethods } from './cart';

describe('getShippingMethods', () => {
  it('returns API methods when present', () => {
    const methods = [{ id: 'express', label: 'Express', cost: '99.00' }];
    expect(
      getShippingMethods({
        items: [],
        cart_token: null,
        shipping_methods: methods,
      }),
    ).toEqual(methods);
  });

  it('falls back to the shared defaults', () => {
    expect(getShippingMethods()).toEqual(DEFAULT_SHIPPING_METHODS);
    expect(
      getShippingMethods({ items: [], cart_token: null, shipping_methods: [] }),
    ).toEqual(DEFAULT_SHIPPING_METHODS);
  });
});
