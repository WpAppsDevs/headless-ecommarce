'use client';

import { Hourglass, PackageX, Package } from 'lucide-react';
import type { Order } from '@/lib/api/orders';
import type { UserProfile } from '@/lib/api/checkout';
import { filterCheckoutDrafts } from '@/lib/order-utils';
import { StatsCard } from './StatsCard';
import { useDictionary } from '@/i18n/LocaleProvider';
import { useFormatPrice } from '@/lib/utils/currency';

interface DashboardProps {
  profile: UserProfile | null;
  orders: Order[];
}

/**
 * WooCommerce slugs → dictionary keys. `on-hold` is the only slug that is not a
 * valid identifier, so the mapping exists rather than a lookup by slug.
 */
const STATUS_KEYS = {
  pending: 'pending',
  processing: 'processing',
  'on-hold': 'onHold',
  delivery: 'delivery',
  completed: 'completed',
  cancelled: 'cancelled',
  refunded: 'refunded',
} as const;

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-orange-50 text-orange-500',
  processing: 'bg-blue-50 text-blue-600',
  'on-hold':  'bg-amber-50 text-amber-600',
  delivery:   'bg-purple-50 text-purple-600',
  completed:  'bg-green-50 text-green-600',
  cancelled:  'bg-red-50 text-red-500',
  refunded:   'bg-zinc-100 text-zinc-600',
};



export function Dashboard({ orders }: DashboardProps) {
  const copy = useDictionary().account;
  const visibleOrders   = filterCheckoutDrafts(orders);
  const totalOrders     = visibleOrders.length;
  const awaitingPickup  = visibleOrders.filter(o => ['pending', 'processing', 'on-hold'].includes(o.status)).length;
  const cancelledOrders = visibleOrders.filter(o => o.status === 'cancelled').length;
  const recentOrders    = visibleOrders.slice(0, 6);
  const fmt             = useFormatPrice();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">{copy.dashboard.title}</h2>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={copy.dashboard.awaitingPickup} value={awaitingPickup} icon={Hourglass} />
        <StatsCard label={copy.dashboard.cancelledOrders} value={cancelledOrders} icon={PackageX} />
        <StatsCard label={copy.dashboard.totalOrders} value={totalOrders} icon={Package} />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-5">
          <h3 className="text-base font-semibold text-zinc-900">{copy.dashboard.recentOrders}</h3>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">{copy.dashboard.noOrders}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-3">{copy.dashboard.colOrder}</th>
                  <th className="px-6 py-3">{copy.dashboard.colProducts}</th>
                  <th className="px-6 py-3">{copy.dashboard.colPricing}</th>
                  <th className="px-6 py-3">{copy.dashboard.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentOrders.map(order => {
                  const badgeClass = STATUS_STYLES[order.status] ?? STATUS_STYLES['pending'];
                  const firstItem  = order.line_items[0];
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-zinc-50">
                      <td className="px-6 py-4 font-medium text-zinc-900">{order.id}</td>
                      <td className="px-6 py-4">
                        {firstItem ? (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100" />
                            <div>
                              <p className="line-clamp-1 font-medium text-zinc-900">{firstItem.name}</p>
                              <p className="text-xs text-zinc-400">Women, Clothing</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-700">{fmt(Number(order.total))}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                          {order.status in STATUS_KEYS
                            ? copy.statuses[STATUS_KEYS[order.status as keyof typeof STATUS_KEYS]]
                            : order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
