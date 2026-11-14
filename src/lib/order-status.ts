/**
 * One source of truth for order status presentation.
 *
 * Two account components used to carry their own copy of this map, in raw hex,
 * so a palette change left them behind and the two could drift apart. Classes
 * here are token-derived; `badge` is a complete set for a bordered pill.
 */
export interface OrderStatusStyle {
  label: string;
  badge: string;
}

const ORDER_STATUS_STYLES: Record<string, OrderStatusStyle> = {
  pending: {
    label: 'Pending',
    badge: 'bg-brand-preorder/10 text-brand-preorder border-brand-preorder/30',
  },
  processing: {
    label: 'Processing',
    badge: 'bg-brand-preorder/10 text-brand-preorder border-brand-preorder/30',
  },
  delivery: {
    label: 'Delivery',
    badge: 'bg-brand-preorder/10 text-brand-preorder border-brand-preorder/30',
  },
  'on-hold': {
    label: 'On Hold',
    badge: 'bg-brand-text-muted/10 text-brand-text-muted border-brand-border',
  },
  completed: {
    label: 'Delivered',
    badge: 'bg-brand-stock/10 text-brand-stock border-brand-stock/30',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
  },
  failed: {
    label: 'Failed',
    badge: 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
  },
  refunded: {
    label: 'Refunded',
    badge: 'bg-brand-card text-brand-text-muted border-brand-border',
  },
};

export function orderStatusStyle(status: string): OrderStatusStyle {
  return ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.pending;
}
