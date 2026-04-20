'use client';

import { X } from 'lucide-react';
import type { Order } from '@/lib/api/orders';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'text-orange-500',
  processing: 'text-blue-600',
  'on-hold':  'text-amber-600',
  delivery:   'text-purple-600',
  completed:  'text-green-600',
  cancelled:  'text-red-500',
  refunded:   'text-zinc-600',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', processing: 'Processing', 'on-hold': 'On Hold',
  delivery: 'Delivery', completed: 'Completed', cancelled: 'Canceled', refunded: 'Refunded',
};

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const statusText  = STATUS_LABELS[order.status] ?? order.status;
  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS['pending'];

  const billing  = order.billing;
  const shipping = order.shipping;

  const contactName  = billing ? `${billing.first_name} ${billing.last_name}`.trim() : '—';
  const contactEmail = billing?.email ?? '—';
  const company      = billing?.company ?? '';
  const paymentMethod = order.payment_method_title ?? '—';

  const shippingLines = shipping
    ? [
        `${shipping.first_name} ${shipping.last_name}`.trim(),
        shipping.address_1,
        shipping.address_2,
        [shipping.city, shipping.state].filter(Boolean).join(', '),
        shipping.country,
      ].filter(Boolean)
    : [];

  const billingLines = billing
    ? [
        billing.address_1,
        billing.address_2,
        [billing.city, billing.state].filter(Boolean).join(', '),
        billing.country,
      ].filter(Boolean)
    : [];

  const subtotal       = Number(order.total);
  const shippingTotal  = Number(order.shipping_total ?? 0);
  const discountTotal  = Number(order.discount_total ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Two-panel body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left panel – order meta */}
          <div className="w-1/2 overflow-y-auto border-r border-zinc-100 px-8 py-7">
            <div className="mb-7 flex items-start justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Order Details</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Contact */}
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">Contact Information</p>
                <p className="font-semibold text-zinc-900">{contactName}</p>
                <p className="font-semibold text-zinc-900">{contactEmail}</p>
              </div>

              {/* Payment */}
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">Payment Method</p>
                <p className="font-semibold text-zinc-900">{paymentMethod}</p>
              </div>

              {/* Shipping address */}
              {shippingLines.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">Shipping Address</p>
                  <address className="not-italic leading-relaxed text-zinc-900">
                    {shippingLines.map((line, i) => (
                      <span key={i} className="block font-semibold">{line}</span>
                    ))}
                  </address>
                </div>
              )}

              {/* Billing address */}
              {billingLines.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">Billing Address</p>
                  <address className="not-italic leading-relaxed text-zinc-900">
                    {billingLines.map((line, i) => (
                      <span key={i} className="block font-semibold">{line}</span>
                    ))}
                  </address>
                </div>
              )}

              {/* Company */}
              {company && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">Company</p>
                  <p className="font-semibold text-zinc-900">{company}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel – items + summary */}
          <div className="w-1/2 overflow-y-auto px-8 py-7">
            <h3 className="mb-5 text-xl font-bold text-zinc-900">Items</h3>

            <div>
              {order.line_items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-start gap-4 py-4">
                    <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-100" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug text-zinc-900">{item.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        <span className="font-medium text-zinc-700">Color:</span> —
                      </p>
                      <p className="text-sm text-zinc-500">
                        <span className="font-medium text-zinc-700">Size:</span> —
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-orange-500">
                      ${Number(item.line_total).toFixed(2)}
                    </p>
                  </div>
                  {idx < order.line_items.length - 1 && (
                    <div className="border-t border-zinc-100" />
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Shipping</span>
                <span>{shippingTotal === 0 ? 'Free' : `$${shippingTotal.toFixed(2)}`}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Discounts</span>
                  <span>-${discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-100 pt-3">
                <span className="text-lg font-bold text-zinc-900">Subtotal</span>
                <span className="text-xl font-bold text-zinc-900">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-8 py-4">
          <p className="text-sm text-zinc-700">
            <span className="font-medium">Order Number: </span>
            <span className="font-semibold">#{order.id}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Order Status:</span>
            <span className={`text-sm font-semibold ${statusColor}`}>{statusText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
