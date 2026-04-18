'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductCategory } from '@/lib/api/products';

const TABS = ['Description', 'Additional Info', 'Reviews', 'Shipping & Returns'] as const;
type Tab = (typeof TABS)[number];

interface Props {
  description?: string;
  sku?: string;
  categories?: ProductCategory[];
}

export function ProductTabs({ description, sku, categories }: Props) {
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
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-zinc-900">4.5</div>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      fill={i <= 4 ? '#f59e0b' : 'none'}
                      stroke={i <= 4 ? '#f59e0b' : '#d1d5db'}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-zinc-400">Based on 128 reviews</p>
              </div>

              {/* Star bars */}
              <div className="flex-1 space-y-1.5">
                {[
                  { stars: 5, pct: 60 },
                  { stars: 4, pct: 25 },
                  { stars: 3, pct: 10 },
                  { stars: 2, pct: 3 },
                  { stars: 1, pct: 2 },
                ].map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-4 text-xs text-zinc-500">{stars}</span>
                    <Star className="h-3 w-3 text-amber-400" fill="#fbbf24" stroke="#fbbf24" />
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-100">
                      <div
                        className="h-1.5 rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-zinc-400">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm italic text-zinc-400">Be the first to review.</p>
          </div>
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
