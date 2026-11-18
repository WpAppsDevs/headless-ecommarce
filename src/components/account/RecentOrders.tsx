'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PackageOpen } from 'lucide-react';
import type { Order } from '@/lib/api/orders';
import { orderStatusStyle } from '@/lib/order-status';
import { useDictionary } from '@/i18n/LocaleProvider';
import { interpolate } from '@/i18n/interpolate';
import { useFormatPrice } from '@/lib/utils/currency';

interface RecentOrdersProps {
  orders: Order[];
  locale: string;
  onOpen: (order: Order) => void;
}

/** The last three orders as compact rows; the whole list lives in the Orders tab. */
export function RecentOrders({ orders, locale, onOpen }: RecentOrdersProps) {
  const copy = useDictionary().account;
  const fmt = useFormatPrice();

  const fmtDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-border bg-white">
      <div className="flex items-center justify-between border-b border-brand-border px-5 py-3.5">
        <h3 className="text-sm font-semibold text-brand-text">{copy.dashboard.recentOrders}</h3>
        <Link
          href="/account?tab=orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent-strong hover:underline"
        >
          {copy.dashboard.allOrders}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      {orders.map((order) => {
        const firstItem = order.line_items[0];
        const extraItems = order.line_items.length - 1;

        return (
          <button
            key={order.id}
            type="button"
            onClick={() => onOpen(order)}
            className="flex w-full items-center gap-3 border-b border-brand-border px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-brand-bg"
          >
            <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-card">
              {firstItem?.image ? (
                <Image
                  src={firstItem.image}
                  alt=""
                  width={48}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <PackageOpen className="h-5 w-5 text-brand-text-muted" strokeWidth={1.4} aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-brand-text">
                {interpolate(copy.orders.orderId, { id: String(order.id) })}
                <span className="ml-2 font-normal text-brand-text-muted">
                  {fmtDate(order.date_created)}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-xs text-brand-text-muted">
                {firstItem?.name ?? copy.dashboard.noOrders}
                {extraItems > 0 &&
                  ` · ${interpolate(copy.dashboard.moreItems, { count: String(extraItems) })}`}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[13px] font-semibold text-brand-text">{fmt(order.total)}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${orderStatusStyle(order.status).badge}`}
              >
                {copy.statuses[orderStatusStyle(order.status).key]}
              </span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
