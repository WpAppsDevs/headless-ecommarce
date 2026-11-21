'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, ShoppingBag, Timer } from 'lucide-react';
import type { Order } from '@/lib/api/orders';
import type { UserProfile } from '@/lib/api/checkout';
import { filterCheckoutDrafts } from '@/lib/order-utils';
import { orderStatusStyle } from '@/lib/order-status';
import { isActiveOrder, showsPreOrderWindow } from '@/lib/order-progress';
import { DashboardShortcuts } from './DashboardShortcuts';
import { DashboardStats } from './DashboardStats';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderProgress } from './OrderProgress';
import { RecentOrders } from './RecentOrders';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { intlLocale } from '@/i18n/locales';
import { interpolate } from '@/i18n/interpolate';
import { useFormatPrice } from '@/lib/utils/currency';
import { useWishlistStore } from '@/stores/wishlistStore';
import { PRE_ORDER_WINDOW_DAYS } from '@/lib/delivery';
import { formatNumber, formatRange } from '@/i18n/format';
import { personInitials, personName } from '@/lib/user-name';

interface DashboardProps {
  profile: UserProfile | null;
  orders: Order[];
}

export function Dashboard({ profile, orders }: DashboardProps) {
  const copy = useDictionary().account;
  const language = useLocale();
  const locale = intlLocale(language);
  const fmt = useFormatPrice();
  const wishlistCount = useWishlistStore((s) => s.count);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const visibleOrders = filterCheckoutDrafts(orders);
  const totalOrders = visibleOrders.length;
  const activeOrders = visibleOrders.filter((order) => isActiveOrder(order.status));
  const completedOrders = visibleOrders.filter((order) => order.status === 'completed').length;
  const recentOrders = visibleOrders.slice(0, 3);
  const focusOrder = activeOrders[0] ?? null;

  const name = personName(profile, copy.customer);
  const firstName = name.split(' ')[0] || name;
  const initials = personInitials(profile, '·');

  const fmtDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  return (
    <div className="space-y-4">
      {/* Greeting + the three things a customer opens this page to do */}
      <section className="relative overflow-hidden rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-accent-light/70 via-brand-accent-light/25 to-transparent"
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-accent-strong text-lg font-bold text-white ring-4 ring-brand-accent-light"
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight text-brand-text sm:text-2xl">
              {interpolate(copy.dashboard.welcome, { name: firstName })}
            </h2>
            <p className="mt-1 text-sm text-brand-text-muted">
              {activeOrders.length > 0
                ? interpolate(copy.dashboard.greetingActive, {
                    count: formatNumber(language, activeOrders.length),
                  })
                : copy.dashboard.greetingIdle}
            </p>
          </div>
          <DashboardShortcuts wishlistCount={wishlistCount} />
        </div>
      </section>

      {/* The order that is actually moving — the question this page exists to answer */}
      {focusOrder && (
        <section className="rounded-2xl border border-brand-border bg-white p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-accent-strong">
                {copy.dashboard.activeOrder}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-semibold text-brand-text">
                {interpolate(copy.orders.orderId, { id: String(focusOrder.id) })}
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${orderStatusStyle(focusOrder.status).badge}`}
                >
                  {copy.statuses[orderStatusStyle(focusOrder.status).key]}
                </span>
              </p>
              <p className="mt-1 text-xs text-brand-text-muted">
                {fmtDate(focusOrder.date_created)} ·{' '}
                {focusOrder.line_items.length === 1
                  ? copy.dashboard.itemSingle
                  : interpolate(copy.dashboard.itemsCount, {
                      count: formatNumber(language, focusOrder.line_items.length),
                    })}{' '}
                · <span className="font-semibold text-brand-text">{fmt(focusOrder.total)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(focusOrder)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-accent-strong px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover"
            >
              {copy.orders.viewDetails}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <OrderProgress status={focusOrder.status} />

          {showsPreOrderWindow(focusOrder.status) && (
            <p className="mt-4 flex items-center gap-1.5 border-t border-brand-border pt-3 text-[11px] text-brand-text-muted">
              <Timer className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              {interpolate(copy.dashboard.estimatedDelivery, {
                range: formatRange(language, PRE_ORDER_WINDOW_DAYS.min, PRE_ORDER_WINDOW_DAYS.max),
              })}
            </p>
          )}
        </section>
      )}

      {/* Counts — cancelled came off this row: it is a filter in Orders, not a headline */}
      <DashboardStats
        activeOrders={activeOrders.length}
        completedOrders={completedOrders}
        totalOrders={totalOrders}
      />

      {totalOrders === 0 ? (
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-brand-border bg-white px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg">
            <ShoppingBag className="h-6 w-6 text-brand-accent-strong" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-brand-text">{copy.dashboard.emptyTitle}</h3>
            <p className="max-w-sm text-sm leading-relaxed text-brand-text-muted">
              {copy.dashboard.emptyBody}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-accent-strong px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover"
          >
            {copy.dashboard.browseShop}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <RecentOrders orders={recentOrders} language={language} onOpen={setSelectedOrder} />
      )}

      {/* Wishlist is a count and a door, not a second product grid */}
      <section className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white px-5 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent-light text-brand-accent-strong">
          <Heart className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 text-xs text-brand-text-muted">
          {wishlistCount > 0
            ? interpolate(copy.dashboard.wishlistSaved, { count: String(wishlistCount) })
            : copy.dashboard.wishlistEmpty}
        </p>
        <Link
          href="/account?tab=wishlist"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-accent-strong hover:underline"
        >
          {copy.dashboard.wishlistOpen}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </Link>
      </section>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
