'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Order, OrdersMeta } from '@/lib/api/orders';
import { OrderCard } from './OrderCard';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersProps {
  orders: Order[];
  meta: OrdersMeta;
}

type OrderStatus = 'all' | 'pending' | 'delivery' | 'completed' | 'cancelled';

export function Orders({ orders, meta }: OrdersProps) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filters: Array<{ id: OrderStatus; label: string }> = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders =
    activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter);

  return (
    <>
      <div className="space-y-6">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-zinc-200">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeFilter === id
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
              <p className="text-sm text-zinc-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={() => setSelectedOrder(order)}
              />
            ))
          )}
        </div>

        {/* Pagination info */}
        {meta && (
          <div className="text-center text-xs text-zinc-500">
            Showing {filteredOrders.length} of {meta.total} orders
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
