'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Loader2, AlertCircle, PackageX } from 'lucide-react';
import { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrackingForm } from '@/components/tracking/TrackingForm';
import { TrackingCard } from '@/components/tracking/TrackingCard';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { searchTracking } from '@/lib/api/tracking';
import { ApiError } from '@/lib/errors';
import type { TrackingResult } from '@/lib/api/tracking';

export default function TrackOrderPage() {
  const router = useRouter();
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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Track Your Order"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Track Order' }]}
        />

        {/* Search Form */}
        <div className="mb-8">
          <TrackingForm onSubmit={handleTrackOrder} isLoading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Searching for your order...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-red-900">Unable to find order</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !result && (
          <div className="text-center py-16 space-y-4">
            <MapPin className="h-12 w-12 text-zinc-300 mx-auto" />
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Enter your email address to track your order
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                You can optionally provide an order number for faster lookup
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
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
      </div>
    </main>
  );
}
