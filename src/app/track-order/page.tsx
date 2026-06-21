'use client';

import { useState } from 'react';
import { Search, MapPin, Loader2, AlertCircle, PackageX } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrackingForm } from '@/components/tracking/TrackingForm';
import { TrackingCard } from '@/components/tracking/TrackingCard';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { searchTracking } from '@/lib/api/tracking';
import { ApiError } from '@/lib/errors';
import type { TrackingResult } from '@/lib/api/tracking';

export default function TrackOrderPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function handleTrackOrder(email: string, orderId?: number) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchTracking({ email, order_id: orderId });
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Track Your Order"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Track Order' },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Search Form */}
        <div className="rounded-2xl border border-brand-border bg-brand-section p-6 shadow-sm">
          <TrackingForm onSubmit={handleTrackOrder} isLoading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
            <p className="text-sm text-brand-text-muted">Searching for your order...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-red-900">Unable to find order</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !result && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <MapPin className="h-12 w-12 text-brand-border" />
            <div>
              <p className="text-sm font-medium text-brand-text-muted">
                Enter your email address to track your order
              </p>
              <p className="text-xs text-brand-text-muted/60 mt-1">
                You can optionally provide an order number for faster lookup
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && result.orders.length > 0 && (
          <div className="space-y-6">
            {result.orders.map((order) => (
              <div key={order.id} className="space-y-6">
                <TrackingCard order={order} tracking={result.tracking} />
                <TrackingTimeline
                  events={result.timeline}
                  currentStatus={result.tracking.status ?? order.status}
                />
              </div>
            ))}
          </div>
        )}

        {/* No Orders Found */}
        {result && !loading && result.orders.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <PackageX className="h-12 w-12 text-zinc-300 mx-auto" />
            <div>
              <p className="text-sm font-medium text-zinc-500">
                No orders found for this email address
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
