'use client';

import { useState } from 'react';
import { MapPin, Loader2, AlertCircle, PackageX } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrackingForm } from '@/components/tracking/TrackingForm';
import { TrackingAccordion } from '@/components/tracking/TrackingAccordion';
import { searchTracking, getTrackingByOrderId } from '@/lib/api/tracking';
import { ApiError } from '@/lib/errors';
import type { TrackingResult } from '@/lib/api/tracking';
import { isCheckoutDraftStatus } from '@/lib/order-utils';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';

export default function TrackOrderPage() {
  const dictionary = useDictionary();
  const copy = dictionary.trackOrder;
  const { isAuthenticated, hydrated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [showAll, setShowAll] = useState(false);

  async function handleTrackOrder(email: string, orderId?: number) {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowAll(false);

    try {
      if (isAuthenticated && orderId) {
        const data = await getTrackingByOrderId(orderId);
        setResult(data);
      } else if (!isAuthenticated) {
        if (!email) {
          setError(copy.errorEmailRequired);
          setLoading(false);
          return;
        }
        const data = await searchTracking({ email, order_id: orderId });
        setResult(data);
      } else {
        setError(copy.errorOrderNumberRequired);
        setLoading(false);
        return;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(copy.errorGeneric);
      }
    } finally {
      setLoading(false);
    }
  }

  const visibleEntries = result
    ? result.entries.filter((entry) => !isCheckoutDraftStatus(entry.order.status))
    : [];
  const displayedEntries = showAll ? visibleEntries : visibleEntries.slice(0, 5);

  return (
    <>
      <PageHeader
        title={dictionary.pages.trackOrder.title}
        breadcrumbLabel={dictionary.common.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: '/' },
          { label: dictionary.pages.trackOrder.title },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Search Form */}
        <div className="rounded-2xl border border-brand-border bg-brand-section p-6 shadow-sm">
          <TrackingForm onSubmit={handleTrackOrder} isLoading={loading} isAuthenticated={isAuthenticated} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent-strong" />
            <p className="text-sm text-brand-text-muted">{copy.searching}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-red-900">{copy.errorTitle}</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !result && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <MapPin className="h-12 w-12 text-brand-border" />
            <div>
              {hydrated && isAuthenticated ? (
                <>
                  <p className="text-sm font-medium text-brand-text-muted">
                    {copy.emptyAuthTitle}
                  </p>
                  <p className="text-xs text-brand-text-muted/60 mt-1">
                    {copy.emptyAuthSub}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-brand-text-muted">
                    {copy.emptyGuestTitle}
                  </p>
                  <p className="text-xs text-brand-text-muted/60 mt-1">
                    {copy.emptyGuestSub}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && visibleEntries.length > 0 && (
          <div className="space-y-4">
            {displayedEntries.map((entry, index) => (
              <TrackingAccordion
                key={entry.order.id}
                entry={entry}
                defaultOpen={index === 0}
              />
            ))}

            {visibleEntries.length > 5 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full rounded-xl border border-brand-border bg-brand-section px-4 py-3 text-sm font-medium text-brand-accent-strong transition hover:bg-brand-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-strong"
              >
                {copy.showMore}
              </button>
            )}
          </div>
        )}

        {/* No Orders Found */}
        {result && !loading && visibleEntries.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <PackageX className="h-12 w-12 text-zinc-300 mx-auto" />
            <div>
              <p className="text-sm font-medium text-zinc-500">
                {hydrated && isAuthenticated ? copy.noOrdersAuth : copy.noOrdersGuest}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
