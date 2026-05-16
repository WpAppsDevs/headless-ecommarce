import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewState {
  /** Product IDs reviewed in this session (avoids re-fetch on each order) */
  reviewedProductIds: Set<number>;
  /** Add a product to the reviewed set after a successful submission */
  markAsReviewed: (productId: number) => void;
  /** Returns true if the product has been reviewed in this session */
  isReviewed: (productId: number) => boolean;
  /** Clear all state — called on logout */
  clear: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviewedProductIds: new Set(),

  markAsReviewed: (productId) =>
    set((state) => ({
      reviewedProductIds: new Set([...state.reviewedProductIds, productId]),
    })),

  isReviewed: (productId) => get().reviewedProductIds.has(productId),

  clear: () => set({ reviewedProductIds: new Set() }),
}));
