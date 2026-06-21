import { Package, Calendar, CreditCard, DollarSign, Mail } from 'lucide-react';
import type { TrackingOrder, TrackingInfo } from '@/lib/api/tracking';

interface TrackingCardProps {
  order: TrackingOrder;
  tracking: TrackingInfo;
}

export function TrackingCard({ order, tracking }: TrackingCardProps) {
  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    processing: { bg: 'bg-brand-accent/10', text: 'text-brand-accent', dot: 'bg-brand-accent' },
    pending: { bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    refunded: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    on_hold: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  };

  const colors = statusColors[order.status] ?? statusColors.pending;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-section p-6 shadow-sm space-y-5">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-brand-accent" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-brand-text-muted">Order ID</p>
            <p className="text-lg font-bold text-brand-text">#{order.id}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${colors.bg} ${colors.text}`}>
          <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-brand-accent shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-brand-text-muted">Order Date</p>
            <p className="text-sm font-medium text-brand-text">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {order.payment_method && (
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-brand-accent shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-brand-text-muted">Payment Method</p>
              <p className="text-sm font-medium text-brand-text">
                {order.payment_method.toUpperCase()}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <DollarSign className="h-4 w-4 text-brand-accent shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-brand-text-muted">Order Total</p>
            <p className="text-sm font-semibold text-brand-accent">
              {order.currency} {parseFloat(order.total).toFixed(2)}
            </p>
          </div>
        </div>

        {order.billing_email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-brand-accent shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-brand-text-muted">Billing Email</p>
              <p className="text-sm font-medium text-brand-text truncate max-w-[180px]">
                {order.billing_email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Details */}
      {(tracking.provider || tracking.tracking_number) && (
        <div className="pt-4 border-t border-brand-border space-y-3">
          <h3 className="text-sm font-semibold text-brand-text">Shipping Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {tracking.provider && (
              <div>
                <span className="text-brand-text-muted">Carrier:</span>{' '}
                <span className="font-medium text-brand-text capitalize">{tracking.provider}</span>
              </div>
            )}
            {tracking.tracking_number && (
              <div>
                <span className="text-brand-text-muted">Tracking #:</span>{' '}
                <span className="font-mono font-medium text-brand-text">{tracking.tracking_number}</span>
              </div>
            )}
            {tracking.tracking_url && (
              <div className="col-span-full">
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline font-medium text-sm"
                >
                  Track Shipment →
                </a>
              </div>
            )}
            {tracking.estimated_delivery && (
              <div>
                <span className="text-brand-text-muted">Estimated Delivery:</span>{' '}
                <span className="font-medium text-brand-text">
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
