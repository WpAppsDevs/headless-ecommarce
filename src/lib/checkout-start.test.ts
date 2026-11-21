import { describe, expect, it } from 'vitest';
import { checkoutStart } from '@/lib/checkout-start';

describe('checkoutStart', () => {
  it('waits for the session before deciding anything', () => {
    expect(checkoutStart(false, true, 0)).toBe('wait');
  });

  it('waits for the cart, even when it reads empty', () => {
    // The bug: an unread cart is `[]`, which looked like an empty one and
    // bounced a reloaded /checkout to /cart.
    expect(checkoutStart(true, false, 0)).toBe('wait');
  });

  it('redirects only once the cart is known to be empty', () => {
    expect(checkoutStart(true, true, 0)).toBe('redirect-to-cart');
  });

  it('lets a loaded cart through', () => {
    expect(checkoutStart(true, true, 2)).toBe('ready');
  });
});
