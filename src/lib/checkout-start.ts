/**
 * What /checkout should do as soon as it mounts.
 *
 * `wait` is the important one: a full page load starts with an empty cart that
 * has not been read yet, and treating that as "empty" sent anyone who reloaded
 * checkout — or opened it from a link — straight back to /cart.
 */
export type CheckoutStart = 'wait' | 'ready' | 'redirect-to-cart';

export function checkoutStart(
  authHydrated: boolean,
  cartHydrated: boolean,
  itemCount: number,
): CheckoutStart {
  if (!authHydrated || !cartHydrated) return 'wait';

  return itemCount > 0 ? 'ready' : 'redirect-to-cart';
}
