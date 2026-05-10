'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlistStore';

interface WishlistButtonProps {
  productId: number;
  productName?: string;
  /**
   * 'card'   — small circle button for product card grid (absolute-positioned).
   * 'detail' — larger square button for the product detail page sidebar.
   */
  variant?: 'card' | 'detail';
  className?: string;
}

/**
 * Heart toggle button that reads from and writes to the wishlistStore.
 * Works for both authenticated users (server sync) and guests (localStorage).
 */
export function WishlistButton({
  productId,
  productName,
  variant = 'card',
  className,
}: WishlistButtonProps) {
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));
  const isPending = useWishlistStore((s) => s.isPending(productId));

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isPending) void toggle(productId, productName);
  }

  if (variant === 'detail') {
    return (
      <button
        type="button"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={isWishlisted}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'flex h-[52px] w-[52px] items-center justify-center rounded-xl border-2 transition-colors',
          isWishlisted
            ? 'border-rose-500 bg-rose-50 text-rose-500'
            : 'border-zinc-200 text-zinc-400 hover:border-zinc-300',
          isPending && 'cursor-not-allowed opacity-60',
          className,
        )}
      >
        <Heart
          className="h-5 w-5 transition-all duration-200"
          fill={isWishlisted ? 'currentColor' : 'none'}
        />
      </button>
    );
  }

  // variant === 'card'
  return (
    <button
      type="button"
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isWishlisted}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:scale-110',
        isPending && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors duration-200',
          isWishlisted ? 'fill-brand-wine text-brand-wine' : 'text-zinc-400',
        )}
      />
    </button>
  );
}
