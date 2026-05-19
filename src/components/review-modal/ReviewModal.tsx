'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import type { Review } from '@/lib/api/reviews';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewableItem {
  product_id: number;
  name: string;
  image?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number;
  items: ReviewableItem[];
  /** Called after a review is successfully submitted */
  onSuccess?: (review: Review) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewModal({ isOpen, onClose, orderId, items, onSuccess }: ReviewModalProps) {
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(
    items.length === 1 ? items[0] : null,
  );
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset selection when modal opens/items change
  useEffect(() => {
    if (isOpen) {
      setSelectedItem(items.length === 1 ? items[0] : null);
    }
  }, [isOpen, items]);

  // Trap focus — close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (review: Review) => {
    onSuccess?.(review);
    onClose();
  };

  return (
    // Backdrop
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Panel */}
      <div className="relative mx-auto max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-2">
            {selectedItem && items.length > 1 && (
              <button
                onClick={() => setSelectedItem(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                aria-label="Back to product selection"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Write a Review</h2>
              {orderId && (
                <p className="text-xs text-zinc-400">Order #{orderId}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close review modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Product selector — shown when multiple items */}
          {!selectedItem && items.length > 1 && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">Which product would you like to review?</p>
              <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                {items.map((item) => (
                  <li key={item.product_id}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
                    >
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <span className="flex-1 text-sm font-medium text-zinc-800">{item.name}</span>
                      <ChevronLeft className="h-4 w-4 rotate-180 text-zinc-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Review form */}
          {selectedItem && (
            <ReviewForm
              productId={selectedItem.product_id}
              productName={selectedItem.name}
              orderId={orderId}
              onSuccess={handleSuccess}
              onCancel={items.length > 1 ? () => setSelectedItem(null) : onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
