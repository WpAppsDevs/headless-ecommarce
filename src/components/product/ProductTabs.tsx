'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, FileText, Info, Star, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductReviewsSection } from '@/components/reviews/ProductReviewsSection';
import { ReviewsErrorBoundary } from '@/components/reviews/ReviewsErrorBoundary';
import type { ProductCategory, ProductDetails } from '@/lib/api/products';
import type { RatingAggregate } from '@/lib/api/reviews';

interface Props {
  description?: string;
  productDetails?: ProductDetails | null;
  sku?: string;
  categories?: ProductCategory[];
  productId: number;
  productName: string;
  initialAggregate?: RatingAggregate | null;
}

const ACCORDION_ITEMS = [
  { id: 'product-details', title: 'Product Details', icon: FileText },
  { id: 'additional-info', title: 'Additional Info', icon: Info },
  { id: 'shipping-returns', title: 'Shipping & Returns', icon: Truck },
  { id: 'reviews', title: 'Reviews', icon: Star },
] as const;

type AccordionId = (typeof ACCORDION_ITEMS)[number]['id'];

export function ProductTabs({
  description,
  productDetails,
  sku,
  categories,
  productId,
  productName,
  initialAggregate,
}: Props) {
  const [openItem, setOpenItem] = useState<AccordionId | ''>('product-details');

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#reviews') setOpenItem('reviews');
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  function toggle(id: AccordionId) {
    setOpenItem((current) => (current === id ? '' : id));
  }

  const specs = (productDetails?.specs ?? []).filter((s) => s?.label && s?.value);
  const included = (productDetails?.included ?? []).filter((i) => i?.name && Number(i.qty) > 0);
  const hasStructuredDetails = specs.length > 0 || included.length > 0;

  function renderProductDetails() {
    if (!hasStructuredDetails) {
      return (
        <div
          className="prose prose-zinc max-w-3xl"
          dangerouslySetInnerHTML={{
            __html: description ?? '<p>No description available.</p>',
          }}
        />
      );
    }

    return (
      <div>
        {specs.length > 0 && (
          <table className="w-full text-[15px]">
            <tbody>
              {specs.map((row, i) => (
                <tr key={`${row.label}-${i}`} className="border-b border-[#E6DED6] last:border-b-0">
                  <td className="w-[45%] py-3 pr-4 align-top font-medium text-[#3A3A4A] lg:w-[40%]">
                    {row.label}
                  </td>
                  <td className="py-3 text-[#1F2A3C]">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {included.length > 0 && (
          <div className="mt-5 rounded-[12px] bg-[#EADFDC] p-5 sm:p-6">
            <h3 className="font-serif text-lg font-bold text-[#1F2A3C]">{"What's Included"}</h3>
            <ul className="mt-4 space-y-4">
              {included.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-[#6B2A2A]" strokeWidth={1.5} />
                  <span className="text-[15px] text-[#1F2A3C]">
                    {item.qty} × {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {ACCORDION_ITEMS.map((item) => {
        const open = openItem === item.id;
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            id={item.id === 'reviews' ? 'reviews' : undefined}
            className="overflow-hidden rounded-[10px] border border-[#E6DED6] bg-white"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={open}
              aria-controls={`${item.id}-panel`}
              id={`${item.id}-header`}
              className="flex min-h-14 w-full items-center gap-3 px-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9E2F45]"
            >
              <Icon className="h-5 w-5 shrink-0 text-[#1F2A3C]" strokeWidth={1.5} />
              <span className="flex-1 font-serif text-base font-medium text-[#1F2A3C]">
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-[#1F2A3C] transition-transform duration-300',
                  open && 'rotate-180',
                )}
                strokeWidth={1.5}
              />
            </button>

            <div
              id={`${item.id}-panel`}
              role="region"
              aria-labelledby={`${item.id}-header`}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-in-out',
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 py-4">
                  {item.id === 'product-details' && renderProductDetails()}

                  {item.id === 'additional-info' && (
                    <table className="text-sm">
                      <tbody className="divide-y divide-[#E6DED6]">
                        {sku && (
                          <tr>
                            <td className="w-40 py-2 pr-8 font-medium text-[#3A3A4A]">SKU</td>
                            <td className="py-2 text-[#1F2A3C]">{sku}</td>
                          </tr>
                        )}
                        {categories && categories.length > 0 && (
                          <tr>
                            <td className="w-40 py-2 pr-8 font-medium text-[#3A3A4A]">Categories</td>
                            <td className="py-2 text-[#1F2A3C]">
                              {categories.map((c) => c.name).join(', ')}
                            </td>
                          </tr>
                        )}
                        {!sku && (!categories || categories.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 text-[#5A5A5A]">
                              No additional information.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {item.id === 'shipping-returns' && (
                    <ul className="max-w-xl space-y-3 text-sm text-[#5A5A5A]">
                      {[
                        'Standard delivery: 3–6 business days.',
                        'Express delivery: 1–2 business days (additional charge).',
                        'Free shipping on orders over $75.',
                        'Returns accepted within 45 days of purchase.',
                        'Import duties and taxes are non-refundable.',
                      ].map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9E2F45]" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.id === 'reviews' && (
                    <ReviewsErrorBoundary>
                      <ProductReviewsSection
                        productId={productId}
                        productName={productName}
                        initialAggregate={initialAggregate}
                      />
                    </ReviewsErrorBoundary>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
