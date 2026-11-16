/**
 * The store's delivery numbers, in one place.
 *
 * Every surface that quotes a pre-order window or a shipping charge reads these,
 * so the announcement bar, the home page and `/shipping` cannot contradict each
 * other, and English and Bangla format the same figures through `formatNumber`.
 */
export const PRE_ORDER_WINDOW_DAYS = { min: 15, max: 25 } as const;

/** Pre-order air freight, charged per kilogram. */
export const PRE_ORDER_PER_KG = 1850;

/** Weight examples shown under the per-kg rate, in kilograms. */
export const WEIGHT_EXAMPLES = [1, 2, 5];

/** Local delivery, after the product reaches Bangladesh. */
export const LOCAL_DELIVERY = {
  insideDhaka: 90,
  outsideDhaka: 150,
} as const;

/** Charged per extra kilogram, or part of one, above the first. */
export const EXTRA_KG_CHARGE = 20;

/** Free weight allowance before the extra-kilogram charge applies. */
export const INCLUDED_KG = 1;
