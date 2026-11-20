'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, PackageSearch, RotateCw } from 'lucide-react';
import { getOrders } from '@/lib/api/orders';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { ApiError } from '@/lib/errors';
import { useDictionary } from '@/i18n/LocaleProvider';
import { interpolate } from '@/i18n/interpolate';
import { ORDER_FILTERS, statusForFilter } from '@/lib/order-filters';
import type { OrderFilterId } from '@/lib/order-filters';
import { OrderCard } from './OrderCard';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountHeading } from './AccountHeading';
import { OrderFilterMenu } from './OrderFilterMenu';

/** One page of the history. Small enough that "Load more" appears where it is useful. */
const PER_PAGE = 8;

function OrdersSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-brand-border bg-white p-4">
          <div className="flex gap-3">
            <Skeleton className="h-14 w-11 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="mt-4 h-6 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * One filter's history. It is mounted with `key={filter}`, so switching tabs
 * starts from a clean slate instead of resetting state inside an effect, and
 * only the rows of the tab in front of the customer are ever requested.
 */
function OrdersList({ filter }: { filter: OrderFilterId }) {
  const router = useRouter();
  const copy = useDictionary().account.orders;
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<OrdersMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;

    getOrders(1, PER_PAGE, statusForFilter(filter))
      .then((result) => {
        if (cancelled) return;
        setOrders(result.orders);
        setMeta(result.meta);
        setFailed(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // An expired session belongs to the account page, which owns the
        // logout redirect; here any other failure is "the list did not load".
        if (error instanceof ApiError && error.code === 'session_expired') {
          router.replace('/login');
          return;
        }
        // A store that does not register this status has no orders in it, which
        // is an empty tab, not a broken one.
        if (error instanceof ApiError && error.code === 'invalid_status') {
          setOrders([]);
          setMeta(null);
          return;
        }
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, attempt, router]);

  const loadMore = useCallback(async () => {
    if (!meta || loadingMore || loading) return;
    setLoadingMore(true);
    setFailed(false);
    try {
      const next = await getOrders(meta.page + 1, PER_PAGE, statusForFilter(filter));
      setOrders((current) => [...current, ...next.orders]);
      setMeta(next.meta);
    } catch {
      setFailed(true);
    } finally {
      setLoadingMore(false);
    }
  }, [filter, loading, loadingMore, meta]);

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  const hasMore = meta ? meta.page < meta.total_pages : false;

  return (
    <div className="space-y-4">
      {meta && meta.total > 0 && (
        <p className="text-xs text-brand-text-muted">
          {interpolate(copy.showingCount, {
            shown: String(orders.length),
            total: String(meta.total),
          })}
        </p>
      )}

      {loading && <OrdersSkeleton />}

      {!loading && failed && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white px-6 py-12 text-center">
          <p className="text-sm text-brand-text-muted">{copy.loadFailed}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border px-4 text-sm font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
          >
            <RotateCw className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            {copy.retry}
          </button>
        </div>
      )}

      {!loading && orders.length === 0 && !failed && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg">
            <PackageSearch className="h-5 w-5 text-brand-accent-strong" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="text-sm text-brand-text-muted">{copy.noOrders}</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onViewDetails={() => setSelectedOrder(order)} />
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex flex-col items-center gap-2 pt-1">
          {failed && <p className="text-xs text-brand-danger">{copy.loadFailed}</p>}
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-border bg-white px-5 text-sm font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong disabled:opacity-60"
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            )}
            {loadingMore ? copy.loadingMore : copy.loadMore}
          </button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

export function Orders() {
  const copy = useDictionary().account.orders;
  const [activeFilter, setActiveFilter] = useState<OrderFilterId>('all');

  return (
    <div className="space-y-4">
      <AccountHeading title={copy.title} description={copy.subtitle} />

      {/* Phones get one field and a panel of the six statuses; tablets and
          desktops keep the pill row, which shows every status at a glance. */}
      <OrderFilterMenu
        label={copy.filterLabel}
        value={activeFilter}
        onChange={(id) => setActiveFilter(id as OrderFilterId)}
        options={ORDER_FILTERS.map((filter) => ({ id: filter.id, label: copy[filter.labelKey] }))}
      />

      <div
        role="group"
        aria-label={copy.filterLabel}
        className="hidden flex-wrap gap-2 sm:flex"
      >
        {ORDER_FILTERS.map((filter) => {
          const active = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={active}
              className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent-strong ${
                active
                  ? 'border-brand-accent-strong bg-brand-accent-strong text-white'
                  : 'border-brand-border bg-white text-brand-text-muted hover:border-brand-accent-strong hover:text-brand-text'
              }`}
            >
              {copy[filter.labelKey]}
            </button>
          );
        })}
      </div>

      <OrdersList key={activeFilter} filter={activeFilter} />
    </div>
  );
}
