'use client';

import { useState } from 'react';
import { Package, Calendar, CreditCard, Mail, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrackingOrderEntry, TrackingInfo } from '@/lib/api/tracking';
import { TrackingTimeline } from './TrackingTimeline';

interface TrackingAccordionProps {
  entry: TrackingOrderEntry;
  defaultOpen?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  processing: { bg: 'bg-brand-accent/10', text: 'text-brand-accent', dot: 'bg-brand-accent' },
  pending: { bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  refunded: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  on_hold: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function TrackingDetails({ order, tracking }: { order: TrackingOrderEntry['order']; tracking: TrackingInfo }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {order.payment_method && (
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-brand-accent shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-brand-text-muted">Payment Method</p>
              <p className="text-sm font-medium text-brand-text">{order.payment_method.toUpperCase()}</p>
            </div>
          </div>
        )}

        {order.billing_email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-brand-accent shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-brand-text-muted">Billing Email</p>
              <p className="text-sm font-medium text-brand-text truncate max-w-[180px]">{order.billing_email}</p>
            </div>
          </div>
        )}
      </div>

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
                <span className="font-medium text-brand-text">{formatDate(tracking.estimated_delivery)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrackingAccordion({ entry, defaultOpen = false }: TrackingAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { order, tracking, timeline } = entry;

  const colors = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ');
  const headerId = `order-header-${order.id}`;
  const panelId = `order-panel-${order.id}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-section shadow-sm">
      <button
        type="button"
        id={headerId}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[44px] w-full items-center gap-3 p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 sm:p-6"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 shrink-0 text-brand-accent" strokeWidth={1.5} />
            <span className="text-xs text-brand-text-muted">Order ID</span>
            <span className="text-base font-bold text-brand-text">#{order.id}</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
            {statusLabel}
          </span>

          <span className="flex items-center gap-1.5 text-sm text-brand-text-muted">
            <Calendar className="h-4 w-4 text-brand-accent" strokeWidth={1.5} />
            <span className="font-medium text-brand-text">{formatDate(order.created_at)}</span>
          </span>

          <span className="flex items-center gap-1.5 text-sm text-brand-text-muted">
            <span>Order Total:</span>
            <span className="font-semibold text-brand-accent">
              {order.currency} {parseFloat(order.total).toFixed(2)}
            </span>
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-brand-text-muted transition-transform duration-300 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-brand-border p-5 sm:p-6">
            <TrackingDetails order={order} tracking={tracking} />
            <TrackingTimeline
              embedded
              events={timeline}
              currentStatus={tracking.status ?? order.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
