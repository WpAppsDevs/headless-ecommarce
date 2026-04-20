'use client';

import { Order } from '@/lib/api/orders';

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

const statusColors: Record<string, { badge: string; text: string }> = {
  pending: { badge: 'bg-blue-100', text: 'text-blue-700' },
  delivery: { badge: 'bg-amber-100', text: 'text-amber-700' },
  completed: { badge: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { badge: 'bg-red-100', text: 'text-red-700' },
};

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const colors = statusColors[order.status] || statusColors.pending;
  const orderDate = order.date_created
    ? new Date(order.date_created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">Order #{order.id}</h3>
          <p className="mt-1 text-sm text-zinc-500">Placed on {orderDate}</p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${colors.badge} ${colors.text}`}
        >
          {order.status}
        </span>
      </div>

      {/* Order items */}
      <div className="mb-6 space-y-3 border-t border-b border-zinc-100 py-4">
        {order.line_items.length === 0 ? (
          <p className="text-sm text-zinc-500">No items in order</p>
        ) : (
          order.line_items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-zinc-700">
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium text-zinc-900">${item.line_total}</span>
            </div>
          ))
        )}
      </div>

      {/* Order total */}
      <div className="mb-6 flex justify-between">
        <span className="font-semibold text-zinc-900">Total</span>
        <span className="text-xl font-bold text-zinc-900">${Number(order.total).toFixed(2)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          Order Details
        </button>
        {order.status === 'pending' && (
          <button className="flex-1 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
