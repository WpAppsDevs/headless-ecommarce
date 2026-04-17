'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrders, type Order, type OrdersMeta } from '@/lib/api/orders';

// ---------------------------------------------------------------------------
// Status badge colours
// ---------------------------------------------------------------------------

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed:  'default',
  processing: 'default',
  pending:    'secondary',
  'on-hold':  'secondary',
  cancelled:  'destructive',
  refunded:   'outline',
  failed:     'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  completed:  'Completed',
  processing: 'Processing',
  pending:    'Pending',
  'on-hold':  'On Hold',
  cancelled:  'Cancelled',
  refunded:   'Refunded',
  failed:     'Failed',
};

function fmt(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  initialOrders: Order[];
  initialMeta: OrdersMeta;
}

export function OrdersList({ initialOrders, initialMeta }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [meta, setMeta] = useState<OrdersMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrders(page, meta.per_page);
      setOrders(result.orders);
      setMeta(result.meta);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        You have no orders yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className={loading ? 'opacity-50' : ''}>
                <td className="px-4 py-3 font-medium">#{order.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(order.date_created)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANTS[order.status] ?? 'outline'}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {order.currency} {order.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.total_pages} ({meta.total} orders)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={meta.page <= 1 || loading}
              onClick={() => loadPage(meta.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={meta.page >= meta.total_pages || loading}
              onClick={() => loadPage(meta.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
