'use client';

import { Hourglass, PackageX, Package } from 'lucide-react';
import type { Order } from '@/lib/api/orders';
import type { UserProfile } from '@/lib/api/checkout';
import { StatsCard } from './StatsCard';

interface DashboardProps {
  profile: UserProfile | null;
  orders: Order[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-orange-50 text-orange-500',
  processing: 'bg-blue-50 text-blue-600',
  'on-hold':  'bg-amber-50 text-amber-600',
  delivery:   'bg-purple-50 text-purple-600',
  completed:  'bg-green-50 text-green-600',
  cancelled:  'bg-red-50 text-red-500',
  refunded:   'bg-zinc-100 text-zinc-600',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', processing: 'Processing', 'on-hold': 'On Hold',
  delivery: 'Delivery', completed: 'Completed', cancelled: 'Canceled', refunded: 'Refunded',
};

export function Dashboard({ orders }: DashboardProps) {
  const totalOrders     = orders.length;
  const awaitingPickup  = orders.filter(o => ['pending', 'processing', 'on-hold'].includes(o.status)).length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const recentOrders    = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Awaiting Pickup"        value={awaitingPickup}  icon={Hourglass} />
        <StatsCard label="Cancelled Orders"       value={cancelledOrders} icon={PackageX}  />
        <StatsCard label="Total Number of Orders" value={totalOrders}     icon={Package}   />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-5">
          <h3 className="text-base font-semibold text-zinc-900">Recent Orders</h3>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Pricing</th>
                  <th className="px-6 py-3">Status</th>
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
                      <td className="px-6 py-4 text-zinc-700">${Number(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
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
