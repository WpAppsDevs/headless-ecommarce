'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, PackageOpen, ReceiptText } from 'lucide-react';
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
      <div className="flex items-center gap-2.5 border-b border-brand-border px-4 py-3.5 sm:px-5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-accent-light text-brand-accent-strong">
          <ReceiptText className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-text">
          {copy.dashboard.recentOrders}
        </h3>
        <Link
          href="/account?tab=orders"
          className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-border px-3 py-1.5 text-[11px] font-semibold text-brand-accent-strong transition-colors hover:border-brand-accent-strong/40 hover:bg-brand-accent-light"
        >
          {copy.dashboard.allOrders}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      </div>

      {orders.map((order) => {
        const firstItem = order.line_items[0];
        const extraItems = order.line_items.length - 1;
        const status = orderStatusStyle(order.status);

        return (
          <button
            key={order.id}
            type="button"
            onClick={() => onOpen(order)}
            className="group flex w-full items-center gap-3 border-b border-brand-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-brand-bg/70 sm:gap-3.5 sm:px-5"
          >
            <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-card ring-1 ring-brand-border/70">
              {firstItem?.image ? (
                <Image
                  src={firstItem.image}
                  alt=""
                  width={56}
                  height={64}
                  className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <PackageOpen
                    className="h-5 w-5 text-brand-text-muted"
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                </span>
              )}
              {extraItems > 0 && (
                <span className="absolute bottom-0 right-0 rounded-tl-md bg-brand-text/80 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
                  +{extraItems}
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
              <span className="mt-1 block truncate text-xs text-brand-text-muted">
                {firstItem?.name ?? copy.dashboard.noOrders}
                {extraItems > 0 &&
                  ` · ${interpolate(copy.dashboard.moreItems, { count: String(extraItems) })}`}
              </span>
            </span>

            <span className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[13px] font-semibold text-brand-text nums-lining">
                {fmt(order.total)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.chip}`}
              >
                {copy.statuses[status.key]}
              </span>
            </span>

            <ChevronRight
              className="hidden h-4 w-4 shrink-0 text-brand-border transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-accent-strong sm:block"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </section>
  );
}
