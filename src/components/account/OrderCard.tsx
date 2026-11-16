'use client';

import { useState } from 'react';
import { Eye, Home, PenLine } from 'lucide-react';
import type { Order } from '@/lib/api/orders';
import { useReviewStore } from '@/stores/reviewStore';
import { ReviewModal } from '@/components/review-modal/ReviewModal';
import type { ReviewableItem } from '@/components/review-modal/ReviewModal';
import { orderStatusStyle } from '@/lib/order-status';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { intlLocale } from '@/i18n/locales';

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

const PAID_STATUSES = ['completed', 'processing'];

function fmtDate(dateStr: string | null, locale: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const dict = useDictionary().account;
  const copy = dict.orders;
  const locale = intlLocale(useLocale());
  const sc        = orderStatusStyle(order.status);
  const isPaid    = PAID_STATUSES.includes(order.status);

  const isReviewed = useReviewStore((s) => s.isReviewed);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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

  // Eligibility: order must be paid and not fully refunded
  const totalRefunded = (order.refunds ?? []).reduce(
    (sum, r) => sum + Math.abs(parseFloat(r.total)),
    0,
  );
  const isFullyRefunded = totalRefunded >= parseFloat(order.total);
  const eligibleItems: ReviewableItem[] = isPaid && !isFullyRefunded
    ? order.line_items
        .filter((item) => !isReviewed(item.product_id))
        .map((item) => ({ product_id: item.product_id, name: item.name, image: item.image }))
    : [];
  const hasReviewableItems = eligibleItems.length > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Row 1 – Order ID + Date */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <span className="text-[13px] text-zinc-800">
          <span className="font-medium">{copy.orderId.replace('{id}','').trim()} </span>
          <span className="font-bold">#{order.id}</span>
        </span>
        <span className="text-[13px] text-zinc-500">
          <span className="font-medium text-zinc-600">{copy.date.replace('{date}','').trim()} </span>
          {fmtDate(order.date_created, locale)}
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
          {copy.amount}{' '}
          <span className="font-semibold text-zinc-900">{order.currency} {order.total}</span>
          {isPaid && (
            <span className="ml-1.5 text-xs font-semibold text-brand-stock">{copy.paid}</span>
          )}
        </p>
        <p className="text-[13px] text-zinc-600">
          {copy.itemsCount} <span className="font-semibold text-zinc-900">{order.line_items.length}</span>
        </p>
        <p className="ml-auto text-[13px] text-zinc-600">
          {copy.payment} <span className="font-semibold text-zinc-900">{order.payment_method_title ?? '—'}</span>
        </p>
      </div>

      <div className="mx-6 border-t border-zinc-100" />

      {/* Row 4 – Status badge + action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-zinc-500">{copy.status}</span>
          <span className={`rounded-md border px-3 py-0.5 text-[11px] font-semibold ${sc.badge}`}>
            {dict.statuses[sc.key]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasReviewableItems && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-brand-preorder/40 px-4 py-2 text-[12px] font-semibold text-brand-preorder transition hover:bg-brand-preorder/5"
            >
              <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
              {copy.writeReview}
            </button>
          )}
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1.5 rounded-lg bg-brand-wine px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
            {copy.viewDetails}
          </button>
        </div>
      </div>

      {/* Review modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        orderId={order.id}
        items={eligibleItems}
      />
    </div>
  );
}
