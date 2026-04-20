'use client';

import { X } from 'lucide-react';
import { Order } from '@/lib/api/orders';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

const statusColors: Record<string, { badge: string; text: string }> = {
  pending: { badge: 'bg-blue-100', text: 'text-blue-700' },
  delivery: { badge: 'bg-amber-100', text: 'text-amber-700' },
  completed: { badge: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { badge: 'bg-red-100', text: 'text-red-700' },
};

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const colors = statusColors[order.status] || statusColors.pending;
  const orderDate = order.date_created
    ? new Date(order.date_created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Order #{order.id}</h2>
            <p className="mt-1 text-sm text-zinc-500">{orderDate}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Status */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-600">Status:</span>
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${colors.badge} ${colors.text}`}
          >
            {order.status}
          </span>
        </div>

        {/* Divider */}
        <div className="mb-6 border-t border-zinc-200" />

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Order Items</h3>
          <div className="space-y-3">
            {order.line_items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                <div className="flex-1">
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-zinc-900">${item.line_total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 border-t border-zinc-200" />

        {/* Order Summary */}
        <div className="mb-6 space-y-3 rounded-lg bg-zinc-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">Subtotal</span>
            <span className="text-zinc-900">${Number(order.total).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-3">
            <span className="font-semibold text-zinc-900">Total</span>
            <span className="text-xl font-bold text-zinc-900">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Currency info */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs text-zinc-600">
            <strong>Currency:</strong> {order.currency}
          </p>
        </div>

        {/* Close button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            Close
          </button>
          {order.status === 'pending' && (
            <button className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
