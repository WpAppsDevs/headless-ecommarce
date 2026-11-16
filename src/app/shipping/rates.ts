/**
 * The shipping numbers, in one place.
 *
 * Both languages render these through `formatTaka` / `formatNumber`, so the
 * English and Bangla pages cannot drift apart on a price, and changing a rate
 * is a one-line edit rather than a hunt through two JSX files.
 */
export const PRE_ORDER_PER_KG = 1850;

/** Weight examples shown under the per-kg rate, in kilograms. */
export const WEIGHT_EXAMPLES = [1, 2, 5];

export const LOCAL_DELIVERY = {
  insideDhaka: 90,
  outsideDhaka: 150,
} as const;

/** Charged per extra kilogram, or part of one, above the first. */
export const EXTRA_KG_CHARGE = 20;

/** Free weight allowance before the extra-kilogram charge applies. */
export const INCLUDED_KG = 1;
