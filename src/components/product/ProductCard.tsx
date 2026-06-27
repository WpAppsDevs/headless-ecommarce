'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import type { Product } from '@/lib/api/products';
import { useFormatPrice } from '@/lib/utils/currency';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23FBF7F5%22/%3E%3C/svg%3E';

const MAROON = '#5C1A22';
const MAROON_DARK = '#4A1119';

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ score = 4.5, count = 0 }: { score?: number; count?: number }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${score} out of 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const halfFilled = i === full && half;
          return (
            <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
              {halfFilled && (
                <defs>
                  <linearGradient id={`hstar-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
              )}
              <path
                fill={filled ? '#facc15' : halfFilled ? `url(#hstar-${i})` : '#e5e7eb'}
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-amber-500">{score}</span>
      {count > 0 && (
        <span className="text-xs text-brand-text-muted">({count})</span>
      )}
    </div>
  );
}

// ── Main Card ────────────────────────────────────────────────────────────────
export function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const fmt = useFormatPrice();

  const allImages = (Array.isArray(product.images) ? product.images : []).slice(0, 3);
  const image = allImages[0];
  const isOnSale =
    product.on_sale && product.sale_price && product.sale_price !== product.regular_price;
  const isNew = !product.on_sale;
  const isVariable = product.type === 'variable';
  const isOutOfStock = product.stock_status === 'outofstock';
  const category = product.categories[0]?.name;
  const displayPrice = isOnSale ? product.sale_price : product.price;

  const discount =
    isOnSale && product.regular_price
      ? Math.round(
          ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) /
            parseFloat(product.regular_price)) *
            100,
        )
      : 0;

  async function handleAddToCart() {
    if (adding || isOutOfStock) return;
    setAdding(true);
    setCartDrawerOpen(true);
    try {
      await addItem(product.id, 0, qty);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white transition-all duration-300 hover:shadow-lg hover:border-brand-wine/30">

      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-brand-card"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        {/* Image slider — show activeImg, fade between images */}
        {allImages.length > 0 ? allImages.map((img, i) => (
          <Image
            key={i}
            src={img?.src || PLACEHOLDER}
            alt={i === 0 ? (img?.alt || product.name) : ''}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500 group-hover:scale-105',
              i === activeImg ? 'opacity-100' : 'opacity-0',
            )}
            priority={i === 0}
            aria-hidden={i !== activeImg}
          />
        )) : (
          <Image
            src={PLACEHOLDER}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        )}

        {/* Badges — top-left */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && !isOnSale && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
              style={{ backgroundColor: MAROON }}
            >
              NEW
            </span>
          )}
          {isOnSale && discount > 0 && (
            <span className="rounded-full bg-brand-wine px-3 py-1 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Image carousel dots — clickable, bottom-center */}
        {allImages.length > 1 && (
          <div
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-label="Image navigation"
          >
            {allImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.preventDefault(); setActiveImg(i); }}
                aria-label={`Show image ${i + 1}`}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-200',
                  i === activeImg ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white',
                )}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Wishlist button — always visible, positioned over image top-right */}
      <WishlistButton productId={product.id} productName={product.name} variant="card" />

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="group/name">
          <h3 className="line-clamp-1 text-sm font-bold text-brand-text transition-colors group-hover/name:text-brand-wine sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Category subtitle */}
        {category && (
          <p className="text-xs text-brand-text-muted sm:text-sm">{category}</p>
        )}

        {/* Rating */}
        {(product.rating_count ?? 0) > 0 && product.average_rating && (
          <StarRating
            score={parseFloat(product.average_rating)}
            count={product.rating_count}
          />
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold sm:text-xl" style={{ color: MAROON }}>
            {fmt(Number(displayPrice))}
          </span>
          {isOnSale && product.regular_price && (
            <span className="text-xs text-brand-text-muted line-through">
              {fmt(Number(product.regular_price))}
            </span>
          )}
        </div>

        {/* Variable: prompt to product page for option selection */}
        {isVariable && (
          <p className="text-xs text-brand-text-muted">
            Multiple colors &amp; sizes available
          </p>
        )}

        {/* Push action row to bottom */}
        <div className="flex-1" />

        {/* ── Qty + Action ──────────────────────────────────────────────── */}
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">

          {/* Quantity selector */}
          <div className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-brand-border sm:w-auto">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-10 w-10 items-center justify-center text-brand-text-muted transition-colors hover:bg-brand-card hover:text-brand-text sm:h-9 sm:w-8"
            >
              −
            </button>
            <span
              className="w-8 select-none text-center text-sm font-semibold text-brand-text sm:w-7"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-10 w-10 items-center justify-center text-brand-text-muted transition-colors hover:bg-brand-card hover:text-brand-text sm:h-9 sm:w-8"
            >
              +
            </button>
          </div>

          {/* Add to Cart (simple) / Select Options (variable) */}
          {isOutOfStock ? (
            <span className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-400 sm:flex-1 sm:py-2 sm:text-sm">
              Out of Stock
            </span>
          ) : isVariable ? (
            <Link
              href={`/products/${product.slug}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-white transition-colors sm:flex-1 sm:gap-1.5 sm:py-2 sm:text-sm sm:px-3"
              style={{ backgroundColor: MAROON }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = MAROON_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MAROON)}
            >
              <ShoppingBag className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span>Select Options</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-white transition-opacity sm:flex-1 sm:gap-1.5 sm:py-2 sm:text-sm sm:px-3',
                adding && 'opacity-70',
              )}
              style={{ backgroundColor: adding ? MAROON_DARK : MAROON }}
              onMouseEnter={(e) => {
                if (!adding)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = MAROON_DARK;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = MAROON;
              }}
            >
              <ShoppingBag className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span className="truncate">{adding ? 'Adding…' : 'Add to Cart'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

