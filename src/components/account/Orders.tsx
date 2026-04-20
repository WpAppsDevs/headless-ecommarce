'use client';

import { useState } from 'react';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { OrderCard } from './OrderCard';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersProps {
  orders: Order[];
  meta: OrdersMeta;
}

type OrderFilter = 'all' | 'pending' | 'delivery' | 'completed' | 'cancelled';

const FILTERS: Array<{ id: OrderFilter; label: string }> = [
  { id: 'all',       label: 'All Order'  },
  { id: 'pending',   label: 'Pending'    },
  { id: 'delivery',  label: 'Delivery'   },
  { id: 'completed', label: 'Completed'  },
  { id: 'cancelled', label: 'Canceled'   },
];

export function Orders({ orders, meta }: OrdersProps) {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered =
    activeFilter === 'all'
      ? orders
      : orders.filter(o => o.status === activeFilter);

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900">Your Orders</h2>

        {/* Filter tabs */}
        <div className="flex gap-6 border-b border-zinc-200">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeFilter === id
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 p-10 text-center">
              <p className="text-sm text-zinc-400">No orders found</p>
            </div>
          ) : (
            filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={() => setSelectedOrder(order)}
              />
            ))
          )}
        </div>

        {meta && filtered.length > 0 && (
          <p className="text-center text-xs text-zinc-400">
            Showing {filtered.length} of {meta.total} orders
          </p>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
