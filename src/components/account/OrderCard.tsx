'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, PenLine } from 'lucide-react';
import type { Order } from '@/lib/api/orders';
import { useReviewStore } from '@/stores/reviewStore';
import { ReviewModal } from '@/components/review-modal/ReviewModal';
import type { ReviewableItem } from '@/components/review-modal/ReviewModal';
import { orderStatusStyle } from '@/lib/order-status';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { intlLocale } from '@/i18n/locales';
import { useFormatPrice } from '@/lib/utils/currency';
import { interpolate } from '@/i18n/interpolate';
import { OrderProgress } from './OrderProgress';

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
  const fmt = useFormatPrice();
  const dict = useDictionary().account;
  const copy = dict.orders;
  const locale = intlLocale(useLocale());
  const sc = orderStatusStyle(order.status);
  const isPaid = PAID_STATUSES.includes(order.status);

  const isReviewed = useReviewStore((s) => s.isReviewed);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const b = order.billing;
  const s = order.shipping;
  const name = b
    ? `${b.first_name} ${b.last_name}`.trim()
    : s
      ? `${s.first_name} ${s.last_name}`.trim()
      : '';
  const city = b?.city || s?.city || '';

  const totalRefunded = (order.refunds ?? []).reduce(
    (sum, refund) => sum + Math.abs(parseFloat(refund.total)),
    0,
  );
  const isFullyRefunded = totalRefunded >= parseFloat(order.total);
  const eligibleItems: ReviewableItem[] =
    isPaid && !isFullyRefunded
      ? order.line_items
          .filter((item) => !isReviewed(item.product_id))
          .map((item) => ({ product_id: item.product_id, name: item.name, image: item.image }))
      : [];
  const hasReviewableItems = eligibleItems.length > 0;
  const thumbs = order.line_items.slice(0, 3);
  const extraItems = order.line_items.length - thumbs.length;
  const firstItem = order.line_items[0];
  const itemCount =
    order.line_items.length === 1
      ? dict.dashboard.itemSingle
      : interpolate(dict.dashboard.itemsCount, { count: String(order.line_items.length) });

  return (
    <article className="rounded-xl border border-brand-border bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {thumbs.map((item, index) => (
            <span
              key={item.id}
              className="relative h-14 w-11 overflow-hidden rounded-lg border border-brand-border bg-brand-card"
              style={{ marginLeft: index === 0 ? 0 : -10 }}
            >
              {item.image ? (
                <Image src={item.image} alt="" width={44} height={56} className="h-full w-full object-cover" />
              ) : null}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-[13px] font-semibold text-brand-text">
              {interpolate(copy.orderId, { id: String(order.id) })}
              <span className="ml-2 font-normal text-brand-text-muted">
                {fmtDate(order.date_created, locale)}
              </span>
            </p>
            <p className="text-sm font-semibold text-brand-text">
              {fmt(order.total)}
              {isPaid && <span className="ml-1 text-[10px] font-semibold text-brand-stock">{copy.paid}</span>}
            </p>
          </div>

          {/* What was bought — the question the row exists to answer */}
          <p className="mt-1 truncate text-xs text-brand-text">
            {firstItem?.name ?? copy.noOrders}
            {extraItems > 0 && (
              <span className="text-brand-text-muted">
                {' '}
                {interpolate(dict.dashboard.moreItems, { count: String(extraItems) })}
              </span>
            )}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-brand-text-muted">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sc.badge}`}>
              {dict.statuses[sc.key]}
            </span>
            <span>{itemCount}</span>
            {order.payment_method_title && (
              <>
                <span aria-hidden="true">·</span>
                <span>{order.payment_method_title}</span>
              </>
            )}
            {(name || city) && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="hidden truncate sm:inline">{[name, city].filter(Boolean).join(' · ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <OrderProgress status={order.status} />

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-brand-border pt-3">
        {hasReviewableItems && (
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-preorder/40 px-3 text-xs font-semibold text-brand-preorder transition hover:bg-brand-preorder/5"
          >
            <PenLine className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {copy.writeReview}
          </button>
        )}
        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand-accent-strong px-3.5 text-xs font-semibold text-white transition hover:bg-brand-accent-strong-hover"
        >
          {copy.viewDetails}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        orderId={order.id}
        items={eligibleItems}
      />
    </article>
  );
}
