'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { useDictionary } from '@/i18n/LocaleProvider';
import { filterCheckoutDrafts } from '@/lib/order-utils';
import { OrderCard } from './OrderCard';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersProps {
  orders: Order[];
  meta: OrdersMeta;
}

type OrderFilter = 'all' | 'pending' | 'delivery' | 'completed' | 'cancelled';

const FILTERS: OrderFilter[] = ['all', 'pending', 'delivery', 'completed', 'cancelled'];

const PER_PAGE = 5;

export function Orders({ orders }: OrdersProps) {
  const dict = useDictionary().account;
  const copy = dict.orders;
  const FILTER_LABELS = {
    all: copy.filterAll,
    pending: copy.filterPending,
    delivery: copy.filterDelivery,
    completed: copy.filterCompleted,
    cancelled: copy.filterCancelled,
  };
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  const visibleOrders = filterCheckoutDrafts(orders);

  const filtered =
    activeFilter === 'all'
      ? visibleOrders
      : visibleOrders.filter((order) => order.status === activeFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleFilter = (filter: OrderFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-brand-text">{copy.title}</h2>

        {/* Filter tabs */}
        <div className="flex gap-5 overflow-x-auto border-b border-brand-border">
          {FILTERS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleFilter(id)}
              aria-pressed={activeFilter === id}
              className={`-mb-px min-h-10 whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeFilter === id
                  ? 'border-brand-accent-strong text-brand-accent-strong'
                  : 'border-transparent text-brand-text-muted hover:text-brand-text'
              }`}
            >
              {FILTER_LABELS[id]}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-border bg-white px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg">
                <PackageSearch className="h-5 w-5 text-brand-accent-strong" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="text-sm text-brand-text-muted">{copy.noOrders}</p>
            </div>
          ) : (
            paged.map((order) => (
              <OrderCard key={order.id} order={order} onViewDetails={() => setSelectedOrder(order)} />
            ))
          )}
        </div>

        {/* Numbered pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-border text-brand-text-muted transition hover:bg-white disabled:opacity-40"
              aria-label={dict.pagination.previousPage}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={currentPage === n ? 'page' : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  currentPage === n
                    ? 'border-brand-accent-strong bg-brand-accent-strong text-white'
                    : 'border-brand-border bg-white text-brand-text hover:border-brand-accent-strong'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-border text-brand-text-muted transition hover:bg-white disabled:opacity-40"
              aria-label={dict.pagination.nextPage}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
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
