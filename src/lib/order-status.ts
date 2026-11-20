/**
 * One source of truth for order status presentation.
 *
 * Two account components used to carry their own copy of this map, in raw hex,
 * so a palette change left them behind and the two could drift apart. Classes
 * here are token-derived; `badge` is a complete set for a bordered pill.
 */
export interface OrderStatusStyle {
  /** Dictionary key under `account.statuses`; labels are translated, classes are not. */
  key: OrderStatusKey;
  badge: string;
  /** Solid bar along the leading edge of an order row; one glance answers "what state". */
  accent: string;
  /** Filled pill for the row header, where a bordered badge would read as a button. */
  chip: string;
}

export type OrderStatusKey =
  | 'pending'
  | 'processing'
  | 'delivery'
  | 'onHold'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded';

const ORDER_STATUS_STYLES: Record<string, OrderStatusStyle> = {
  pending: {
    key: 'pending',
    badge: 'bg-brand-preorder/10 text-brand-preorder border-brand-preorder/30',
    accent: 'bg-brand-gold',
    chip: 'bg-brand-bg text-brand-text-muted',
  },
  processing: {
    key: 'processing',
    badge: 'bg-brand-preorder/10 text-brand-preorder border-brand-preorder/30',
    accent: 'bg-brand-accent-strong',
    chip: 'bg-brand-accent-light text-brand-accent-strong',
  },
  delivery: {
    key: 'delivery',
    badge: 'bg-brand-preorder/10 text-brand-preorder border-brand-preorder/30',
    accent: 'bg-brand-accent-strong',
    chip: 'bg-brand-accent-strong text-white',
  },
  'on-hold': {
    key: 'onHold',
    badge: 'bg-brand-text-muted/10 text-brand-text-muted border-brand-border',
    accent: 'bg-brand-border',
    chip: 'bg-brand-bg text-brand-text-muted',
  },
  completed: {
    key: 'completed',
    badge: 'bg-brand-stock/10 text-brand-stock border-brand-stock/30',
    accent: 'bg-brand-stock',
    chip: 'bg-brand-stock/10 text-brand-stock',
  },
  cancelled: {
    key: 'cancelled',
    badge: 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
    accent: 'bg-brand-danger',
    chip: 'bg-brand-danger/10 text-brand-danger',
  },
  failed: {
    key: 'failed',
    badge: 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
    accent: 'bg-brand-danger',
    chip: 'bg-brand-danger/10 text-brand-danger',
  },
  refunded: {
    key: 'refunded',
    badge: 'bg-brand-card text-brand-text-muted border-brand-border',
    accent: 'bg-brand-text-muted',
    chip: 'bg-brand-card text-brand-text-muted',
  },
};

export function orderStatusStyle(status: string): OrderStatusStyle {
  return ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.pending;
}
