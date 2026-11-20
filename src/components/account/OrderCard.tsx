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
import { formatNumber } from '@/i18n/format';
import { isActiveOrder } from '@/lib/order-progress';
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

/**
 * One order in the history.
 *
 * The row answers three questions in one glance — what was bought, where it is,
 * and what it cost. The stage timeline sits inside the card only while the
 * order is still moving; a delivered or cancelled order would be a bar frozen
 * at the end or a bar that lies.
 */
export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const fmt = useFormatPrice();
  const dict = useDictionary().account;
  const copy = dict.orders;
  const locale = useLocale();
  const sc = orderStatusStyle(order.status);
  const isPaid = PAID_STATUSES.includes(order.status);

  const isReviewed = useReviewStore((s) => s.isReviewed);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const b = order.billing;
  const s = order.shipping;
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

  const firstItem = order.line_items[0];
  const extraItems = order.line_items.length - 1;
  const quantity = order.line_items.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount =
    quantity === 1
      ? dict.dashboard.itemSingle
      : interpolate(dict.dashboard.itemsCount, { count: formatNumber(locale, quantity) });

  return (
    <article className="relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
      {/* The status as a colour, before a single word is read. */}
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${sc.accent}`} />

      <div className="flex items-start gap-3">
        <div className="relative h-[64px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-brand-card" aria-hidden="true">
          {firstItem?.image ? (
            <Image src={firstItem.image} alt="" fill sizes="52px" className="object-cover" />
          ) : null}
          {extraItems > 0 && (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white">
              +{extraItems}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] text-brand-text-muted">
              <span className="font-semibold text-brand-text">
                {interpolate(copy.orderId, { id: String(order.id) })}
              </span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              {fmtDate(order.date_created, intlLocale(locale))}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${sc.chip}`}
            >
              {dict.statuses[sc.key]}
            </span>
          </div>

          <p className="mt-1 line-clamp-1 text-sm font-semibold text-brand-text">
            {firstItem?.name ?? copy.noOrders}
          </p>

          <p className="mt-0.5 line-clamp-1 text-[11px] text-brand-text-muted">
            {[itemCount, order.payment_method_title, city].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {isActiveOrder(order.status) && <OrderProgress status={order.status} />}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/70 pt-3">
        <p className="text-[15px] font-semibold text-brand-text">
          {fmt(order.total)}
          {isPaid && <span className="ml-1 text-[11px] font-normal text-brand-text-muted">{copy.paid}</span>}
        </p>

        <div className="flex items-center gap-2">
          {hasReviewableItems && (
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-text"
            >
              <PenLine className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
              {copy.writeReview}
            </button>
          )}
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand-accent-strong px-3.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover"
          >
            {copy.viewDetails}
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
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
