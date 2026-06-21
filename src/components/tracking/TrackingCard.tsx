import { Package, Calendar, CreditCard, DollarSign, Mail } from 'lucide-react';
import type { TrackingOrder, TrackingInfo } from '@/lib/api/tracking';

interface TrackingCardProps {
  order: TrackingOrder;
  tracking: TrackingInfo;
}

export function TrackingCard({ order, tracking }: TrackingCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500">Order ID</p>
            <p className="text-lg font-bold text-zinc-900">#{order.id}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
          order.status === 'completed' ? 'bg-green-50 text-green-700' :
          order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
          order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
          order.status === 'refunded' ? 'bg-yellow-50 text-yellow-700' :
          'bg-zinc-100 text-zinc-600'
        }`}>
          <span className={`h-2 w-2 rounded-full ${
            order.status === 'completed' ? 'bg-green-500' :
            order.status === 'processing' ? 'bg-blue-500' :
            order.status === 'cancelled' ? 'bg-red-500' :
            order.status === 'refunded' ? 'bg-yellow-500' :
            'bg-zinc-400'
          }`} />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500">Order Date</p>
            <p className="text-sm font-medium text-zinc-900">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard className="h-4 w-4 text-zinc-400 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500">Payment Method</p>
            <p className="text-sm font-medium text-zinc-900">
              {order.payment_method?.toUpperCase() ?? 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="h-4 w-4 text-zinc-400 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500">Order Total</p>
            <p className="text-sm font-medium text-zinc-900">
              {order.currency} {parseFloat(order.total).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500">Billing Email</p>
            <p className="text-sm font-medium text-zinc-900 truncate max-w-[180px]">
              {order.billing_email}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Details */}
      {(tracking.provider || tracking.tracking_number) && (
        <div className="pt-4 border-t border-zinc-100 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Shipping Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {tracking.provider && (
              <div>
                <span className="text-zinc-500">Carrier:</span>{' '}
                <span className="font-medium text-zinc-900 capitalize">{tracking.provider}</span>
              </div>
            )}
            {tracking.tracking_number && (
              <div>
                <span className="text-zinc-500">Tracking #:</span>{' '}
                <span className="font-mono font-medium text-zinc-900">{tracking.tracking_number}</span>
              </div>
            )}
            {tracking.tracking_url && (
              <div className="col-span-full">
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-wine hover:underline font-medium text-sm"
                >
                  Track Shipment →
                </a>
              </div>
            )}
            {tracking.estimated_delivery && (
              <div>
                <span className="text-zinc-500">Estimated Delivery:</span>{' '}
                <span className="font-medium text-zinc-900">
                  {new Date(tracking.estimated_delivery).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
