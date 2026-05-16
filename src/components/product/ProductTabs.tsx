'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductReviewsSection } from '@/components/reviews/ProductReviewsSection';
import { ReviewsErrorBoundary } from '@/components/reviews/ReviewsErrorBoundary';
import type { ProductCategory } from '@/lib/api/products';
import type { RatingAggregate } from '@/lib/api/reviews';

const TABS = ['Description', 'Additional Info', 'Reviews', 'Shipping & Returns'] as const;
type Tab = (typeof TABS)[number];

interface Props {
  description?: string;
  sku?: string;
  categories?: ProductCategory[];
  productId: number;
  productName: string;
  initialAggregate?: RatingAggregate | null;
}

export function ProductTabs({ description, sku, categories, productId, productName, initialAggregate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Description');

  return (
    <div>
      {/* Tab nav */}
      <div className="border-b border-zinc-200">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 px-5 py-3 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="py-8">
        {activeTab === 'Description' && (
          <div
            className="prose prose-zinc max-w-3xl"
            dangerouslySetInnerHTML={{
              __html: description ?? '<p>No description available.</p>',
            }}
          />
        )}

        {activeTab === 'Additional Info' && (
          <table className="text-sm">
            <tbody className="divide-y divide-zinc-100">
              {sku && (
                <tr>
                  <td className="py-2 pr-8 font-medium text-zinc-700 w-40">SKU</td>
                  <td className="py-2 text-zinc-500">{sku}</td>
                </tr>
              )}
              {categories && categories.length > 0 && (
                <tr>
                  <td className="py-2 pr-8 font-medium text-zinc-700 w-40">Categories</td>
                  <td className="py-2 text-zinc-500">{categories.map((c) => c.name).join(', ')}</td>
                </tr>
              )}
              {!sku && (!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={2} className="py-2 text-zinc-400">
                    No additional information.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'Reviews' && (
          <ReviewsErrorBoundary>
            <ProductReviewsSection
              productId={productId}
              productName={productName}
              initialAggregate={initialAggregate}
            />
          </ReviewsErrorBoundary>
        )}

        {activeTab === 'Shipping & Returns' && (
          <ul className="max-w-xl space-y-3 text-sm text-zinc-600">
            {[
              'Standard delivery: 3–6 business days.',
              'Express delivery: 1–2 business days (additional charge).',
              'Free shipping on orders over $75.',
              'Returns accepted within 45 days of purchase.',
              'Import duties and taxes are non-refundable.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
