'use client';

import type { Order } from '@/lib/api/orders';

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-orange-50 text-orange-500 border border-orange-200',
  processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  'on-hold':  'bg-amber-50 text-amber-600 border border-amber-200',
  delivery:   'bg-purple-50 text-purple-600 border border-purple-200',
  completed:  'bg-green-50 text-green-600 border border-green-200',
  cancelled:  'bg-red-50 text-red-500 border border-red-200',
  refunded:   'bg-zinc-100 text-zinc-600 border border-zinc-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', processing: 'Processing', 'on-hold': 'On Hold',
  delivery: 'Delivery', completed: 'Completed', cancelled: 'Canceled', refunded: 'Refunded',
};

const CANCELLABLE = ['pending', 'processing', 'on-hold', 'delivery'];

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const badgeClass = STATUS_STYLES[order.status] ?? STATUS_STYLES['pending'];
  const statusText = STATUS_LABELS[order.status] ?? order.status;
  const canCancel  = CANCELLABLE.includes(order.status);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-700">
          <span className="font-medium">Order Number: </span>
          <span className="font-semibold">#{order.id}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Order Status:</span>
          <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${badgeClass}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onViewDetails}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Order Details
        </button>
        {canCancel && (
          <button className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
