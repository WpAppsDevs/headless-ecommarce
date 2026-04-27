'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { OrderCard } from './OrderCard';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersProps {
  orders: Order[];
  meta: OrdersMeta;
}

type OrderFilter = 'all' | 'pending' | 'delivery' | 'completed' | 'cancelled';

const FILTERS: Array<{ id: OrderFilter; label: string }> = [
  { id: 'all',       label: 'All Orders' },
  { id: 'pending',   label: 'Pending'    },
  { id: 'delivery',  label: 'Delivery'   },
  { id: 'completed', label: 'Completed'  },
  { id: 'cancelled', label: 'Canceled'   },
];

const PER_PAGE = 5;

export function Orders({ orders }: OrdersProps) {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  const filtered = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged       = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleFilter = (f: OrderFilter) => { setActiveFilter(f); setPage(1); };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900">My Orders</h2>

        {/* Filter tabs */}
        <div className="flex gap-5 overflow-x-auto border-b border-zinc-200">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleFilter(id)}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeFilter === id
                  ? 'border-brand-wine text-brand-wine'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {paged.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 p-10 text-center">
              <p className="text-sm text-zinc-400">No orders found</p>
            </div>
          ) : (
            paged.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={() => setSelectedOrder(order)}
              />
            ))
          )}
        </div>

        {/* Numbered pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  currentPage === n
                    ? 'border-brand-wine bg-brand-wine text-white'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
