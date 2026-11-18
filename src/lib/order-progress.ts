/**
 * Order progress — the shipping stage an order has reached.
 *
 * The account modal drew a seven-step timeline and the dashboard drew a
 * five-step one, each with its own status table. The two disagreed: one counted
 * `delivery` as done, the other as current, and the dashboard had a "packed"
 * stage no API status could ever reach. Both read the map here now.
 *
 * `reached` is the index of the stage the order is in, so every step before it
 * is done and the step at that index is current. A completed order has reached
 * the end of the list.
 */

export const ORDER_TIMELINE_STEPS = [
  'placed',
  'processing',
  'packing',
  'packed',
  'delivering',
  'payment',
  'delivered',
] as const;

export type OrderTimelineStep = (typeof ORDER_TIMELINE_STEPS)[number];

/** The four stages the dashboard card has room for; each maps to a real status. */
export const COMPACT_ORDER_STEPS = ['placed', 'processing', 'delivering', 'delivered'] as const;

export type CompactOrderStep = (typeof COMPACT_ORDER_STEPS)[number];

/** Statuses that have not shipped yet, so the pre-order window is still the answer. */
const PRE_SHIPMENT_STATUSES = ['pending', 'on-hold', 'processing'];

/** Index into ORDER_TIMELINE_STEPS. `length` means every stage is behind the order. */
const REACHED_STEP: Record<string, number> = {
  pending: 0,
  'on-hold': 0,
  processing: 1,
  delivery: 4,
  completed: ORDER_TIMELINE_STEPS.length,
};

/** Index into COMPACT_ORDER_STEPS. */
const COMPACT_STEP: Record<string, number> = {
  pending: 0,
  'on-hold': 0,
  processing: 1,
  delivery: 2,
  completed: COMPACT_ORDER_STEPS.length,
};

/**
 * The stage an order is in.
 *
 * A cancelled or refunded order returns `null`: its timeline is not "early",
 * it is over, and drawing a progress bar would claim it is still moving.
 */
export function orderTimelineStep(status: string): number | null {
  return REACHED_STEP[status] ?? null;
}

/** The same progress, condensed for the dashboard card. */
export function orderCompactStep(status: string): number | null {
  return COMPACT_STEP[status] ?? null;
}

/**
 * Whether the pre-order delivery window still describes this order.
 *
 * Once an order is out for delivery, quoting 15–25 days would contradict the
 * status beside it.
 */
export function showsPreOrderWindow(status: string): boolean {
  return PRE_SHIPMENT_STATUSES.includes(status);
}

/** Orders that still have a fulfilment step ahead of them. */
export function isActiveOrder(status: string): boolean {
  return PRE_SHIPMENT_STATUSES.includes(status) || status === 'delivery';
}
