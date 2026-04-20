'use client';

import { Order } from '@/lib/api/orders';
import { UserProfile } from '@/lib/api/checkout';
import { StatsCard } from './StatsCard';

interface DashboardProps {
  profile: UserProfile | null;
  orders: Order[];
}

export function Dashboard({ profile, orders }: DashboardProps) {
  // Calculate stats
  const totalOrders = orders.length;
  const awaitingPickup = orders.filter((o) => o.status === 'pending').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

  // Get recent orders (first 5)
  const recentOrders = orders.slice(0, 5);

  const statusColors: Record<string, { badge: string; text: string }> = {
    pending: { badge: 'bg-blue-100', text: 'text-blue-700' },
    delivery: { badge: 'bg-amber-100', text: 'text-amber-700' },
    completed: { badge: 'bg-emerald-100', text: 'text-emerald-700' },
    cancelled: { badge: 'bg-red-100', text: 'text-red-700' },
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatsCard label="Awaiting Pickup" value={awaitingPickup} />
        <StatsCard label="Cancelled Orders" value={cancelledOrders} />
        <StatsCard label="Total Orders" value={totalOrders} />
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900">Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900">Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-900">Order Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const colors = statusColors[order.status] || statusColors.pending;
                  const orderDate = order.date_created
                    ? new Date(order.date_created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-zinc-900">#{order.id}</td>
                      <td className="px-4 py-4 text-zinc-700">${Number(order.total).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${colors.badge} ${colors.text}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-600">{orderDate}</td>
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
