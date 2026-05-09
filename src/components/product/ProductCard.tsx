'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/lib/api/products';

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
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const image = product.images[0];
  const hoverImage = product.images[1];
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
    try {
      await addItem(product.id, 0, qty);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">

      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-brand-card"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        {/* Primary image */}
        <Image
          src={image?.src ?? PLACEHOLDER}
          alt={image?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-all duration-500',
            hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105',
          )}
        />

        {/* Hover / alternate image */}
        {hoverImage && (
          <Image
            src={hoverImage.src}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
        )}

        {/* Badges — top-left */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && !isOnSale && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: MAROON }}
            >
              NEW
            </span>
          )}
          {isOnSale && discount > 0 && (
            <span className="rounded-full bg-brand-wine px-3 py-1 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Image carousel dots — bottom-center (decorative) */}
        <div
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === 0 ? 'bg-white' : 'bg-white/50',
              )}
            />
          ))}
        </div>
      </Link>

      {/* Wishlist button — always visible, positioned over image top-right */}
      <button
        type="button"
        onClick={() => setWished((w) => !w)}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wished}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:scale-110"
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-colors duration-200',
            wished ? 'fill-brand-wine text-brand-wine' : 'text-zinc-400',
          )}
        />
      </button>

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">

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
        <StarRating score={4.5} count={28} />

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold sm:text-xl" style={{ color: MAROON }}>
            ${displayPrice}
          </span>
          {isOnSale && product.regular_price && (
            <span className="text-xs text-brand-text-muted line-through">
              ${product.regular_price}
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
        <div className="mt-1 flex items-center gap-2">

          {/* Quantity selector */}
          <div className="flex items-center overflow-hidden rounded-lg border border-brand-border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-9 w-8 items-center justify-center text-brand-text-muted transition-colors hover:bg-brand-card hover:text-brand-text"
            >
              −
            </button>
            <span
              className="w-7 select-none text-center text-sm font-semibold text-brand-text"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-9 w-8 items-center justify-center text-brand-text-muted transition-colors hover:bg-brand-card hover:text-brand-text"
            >
              +
            </button>
          </div>

          {/* Add to Cart (simple) / Select Options (variable) */}
          {isVariable ? (
            <Link
              href={`/products/${product.slug}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold text-white transition-colors sm:text-sm"
              style={{ backgroundColor: MAROON }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = MAROON_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MAROON)}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              Select Options
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold text-white transition-opacity sm:text-sm',
                isOutOfStock
                  ? 'cursor-not-allowed bg-zinc-300 text-zinc-500'
                  : 'cursor-pointer',
                adding && 'opacity-70',
              )}
              style={isOutOfStock ? {} : { backgroundColor: adding ? MAROON_DARK : MAROON }}
              onMouseEnter={(e) => {
                if (!isOutOfStock && !adding)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = MAROON_DARK;
              }}
              onMouseLeave={(e) => {
                if (!isOutOfStock)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = adding ? MAROON_DARK : MAROON;
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              {isOutOfStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

