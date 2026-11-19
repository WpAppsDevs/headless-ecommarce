/**
 * The order-history filters.
 *
 * The list is paged on the server, so a filter has to be a real WooCommerce
 * status rather than a client-side match over the rows already loaded — a
 * filter that only looked at five rows claimed "none" for orders that existed
 * on page four. `status` is the query value WordPress accepts (one at a time);
 * `all` is the only filter without one.
 */
export type OrderFilterId =
  | 'all'
  | 'pending'
  | 'processing'
  | 'delivery'
  | 'completed'
  | 'cancelled';

export interface OrderFilter {
  id: OrderFilterId;
  /** WooCommerce order status sent to the API; absent on `all`. */
  status?: string;
  /** Key under `account.orders` that holds the tab label. */
  labelKey:
    | 'filterAll'
    | 'filterPending'
    | 'filterProcessing'
    | 'filterDelivery'
    | 'filterCompleted'
    | 'filterCancelled';
}

export const ORDER_FILTERS: readonly OrderFilter[] = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'pending', status: 'pending', labelKey: 'filterPending' },
  { id: 'processing', status: 'processing', labelKey: 'filterProcessing' },
  { id: 'delivery', status: 'delivery', labelKey: 'filterDelivery' },
  { id: 'completed', status: 'completed', labelKey: 'filterCompleted' },
  { id: 'cancelled', status: 'cancelled', labelKey: 'filterCancelled' },
] as const;

/** The status to send for a filter; `undefined` asks for every order. */
export function statusForFilter(id: OrderFilterId): string | undefined {
  return ORDER_FILTERS.find((filter) => filter.id === id)?.status;
}
