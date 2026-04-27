'use client';

import { Eye, Home } from 'lucide-react';
import type { Order } from '@/lib/api/orders';

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-[#D89A6A]/15 text-[#D89A6A] border border-[#D89A6A]/40' },
  processing: { label: 'Processing', cls: 'bg-[#D89A6A]/15 text-[#D89A6A] border border-[#D89A6A]/40' },
  'on-hold':  { label: 'On Hold',    cls: 'bg-[#B39DDB]/15 text-[#B39DDB] border border-[#B39DDB]/40' },
  delivery:   { label: 'Delivery',   cls: 'bg-[#D89A6A]/15 text-[#D89A6A] border border-[#D89A6A]/40' },
  completed:  { label: 'Delivered',  cls: 'bg-[#7BAE7F]/15 text-[#7BAE7F] border border-[#7BAE7F]/40' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-[#E57373]/15 text-[#E57373] border border-[#E57373]/40' },
  refunded:   { label: 'Refunded',   cls: 'bg-zinc-100 text-zinc-500 border border-zinc-200' },
  failed:     { label: 'Failed',     cls: 'bg-[#E57373]/15 text-[#E57373] border border-[#E57373]/40' },
};

const CANCELLABLE = ['pending', 'processing', 'on-hold', 'delivery'];
const PAID_STATUSES = ['completed', 'processing'];

function fmtDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const sc        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const canCancel = CANCELLABLE.includes(order.status);
  const isPaid    = PAID_STATUSES.includes(order.status);

  const b = order.billing;
  const s = order.shipping;

  const name = b
    ? `${b.first_name} ${b.last_name}`.trim()
    : s ? `${s.first_name} ${s.last_name}`.trim() : '—';

  const phone   = b?.phone ?? '';
  const addrSrc = b ?? s;
  const address = addrSrc
    ? [addrSrc.address_1, `${addrSrc.city}, ${addrSrc.state} ${addrSrc.postcode}`.trim()]
        .filter(Boolean).join(' ')
    : '—';

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Row 1 – Order ID + Date */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <span className="text-[13px] text-zinc-800">
          <span className="font-medium">Order ID: </span>
          <span className="font-bold">#{order.id}</span>
        </span>
        <span className="text-[13px] text-zinc-500">
          <span className="font-medium text-zinc-600">Date: </span>
          {fmtDate(order.date_created)}
        </span>
      </div>

      <div className="mx-6 border-t border-zinc-100" />

      {/* Row 2 – Address block */}
      <div className="flex items-start gap-3 px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-200">
          <Home className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        </div>
        <div className="text-[13px] leading-relaxed text-zinc-600">
          <p className="font-semibold text-zinc-900">{name}</p>
          {phone && <p>{phone}</p>}
          <p>{address}</p>
        </div>
      </div>

      <div className="mx-6 border-t border-zinc-100" />

      {/* Row 3 – Amount / Items / Payment */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-1 px-6 py-4">
        <p className="text-[13px] text-zinc-600">
          Amount:{' '}
          <span className="font-semibold text-zinc-900">{order.currency} {order.total}</span>
          {isPaid && (
            <span className="ml-1.5 text-xs font-semibold text-[#7BAE7F]">(Paid)</span>
          )}
        </p>
        <p className="text-[13px] text-zinc-600">
          Items: <span className="font-semibold text-zinc-900">{order.line_items.length}</span>
        </p>
        <p className="ml-auto text-[13px] text-zinc-600">
          Payment: <span className="font-semibold text-zinc-900">{order.payment_method_title ?? '—'}</span>
        </p>
      </div>

      <div className="mx-6 border-t border-zinc-100" />

      {/* Row 4 – Status badge + action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-zinc-500">Status:</span>
          <span className={`rounded-md px-3 py-0.5 text-[11px] font-semibold ${sc.cls}`}>
            {sc.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button className="rounded-lg border border-[#E57373]/60 px-4 py-2 text-[12px] font-semibold text-[#E57373] transition hover:bg-[#E57373]/5">
              Cancel Order
            </button>
          )}
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1.5 rounded-lg bg-brand-wine px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
