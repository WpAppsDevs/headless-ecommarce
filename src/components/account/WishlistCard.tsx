'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ShoppingBag, X } from 'lucide-react';
import type { Product } from '@/lib/api/products';
import { useFormatPrice } from '@/lib/utils/currency';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { taxonomyLabel } from '@/i18n/taxonomy';
import { interpolate } from '@/i18n/interpolate';
import { getProductBadge, isPurchasable } from '@/lib/product-availability';
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge';
import { useCartStore } from '@/stores/cartStore';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23FBF7F5%22/%3E%3C/svg%3E';

interface WishlistCardProps {
  product: Product;
  onRemove: () => void;
}

/**
 * One saved product as a row, not a tile.
 *
 * A row gives the name its full width and puts the price and the cart action
 * where the eye already is, which a four-across grid could not: every name was
 * truncated to the same handful of letters and the only action was "Buy".
 */
export function WishlistCard({ product, onRemove }: WishlistCardProps) {
  const image = product.images[0];
  const fmt = useFormatPrice();
  const copy = useDictionary().account.wishlist;
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const [adding, setAdding] = useState(false);

  const onSale = product.on_sale && product.sale_price && product.sale_price !== product.regular_price;
  const displayPrice = onSale ? product.sale_price : product.price;
  const purchasable = isPurchasable(product);
  const badge = getProductBadge(product);
  const href = `/products/${product.slug}`;

  async function handleAdd() {
    if (adding) return;
    setAdding(true);
    setCartDrawerOpen(true);
    try {
      await addItem(product.id, 0, 1);
    } finally {
      setAdding(false);
    }
  }

  const cartButton = purchasable ? (
    product.type === 'variable' ? (
      <Link
        href={href}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-brand-accent-strong/40 px-3 text-[11px] font-semibold text-brand-accent-strong transition-colors hover:bg-brand-accent-light"
      >
        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        {copy.options}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={adding}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-accent-strong px-3 text-[11px] font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-70"
      >
        {adding ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        )}
        {adding ? copy.adding : copy.addToCart}
      </button>
    )
  ) : (
    <button
      type="button"
      disabled
      className="inline-flex min-h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-brand-bg px-3 text-[11px] font-semibold text-brand-text-muted"
    >
      {copy.soldOut}
    </button>
  );

  return (
    <article className="group relative flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-3 sm:gap-4 sm:p-3.5">
      <Link
        href={href}
        className="relative block h-[96px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-brand-card sm:h-[116px] sm:w-[92px]"
        aria-label={interpolate(copy.viewAria, { name: product.name })}
        tabIndex={-1}
      >
        <Image
          src={image?.src || PLACEHOLDER}
          alt={image?.alt || product.name}
          fill
          sizes="(max-width: 640px) 76px, 92px"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            purchasable ? '' : 'opacity-60'
          }`}
        />
        {badge && (
          <span className="absolute left-1.5 top-1.5">
            <AvailabilityBadge badge={badge} className="px-2 py-0.5 text-[9px] shadow-sm" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col pr-10 sm:pr-0">
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-text transition-colors hover:text-brand-accent-strong sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {product.categories[0] && (
          <p className="mt-0.5 truncate text-[11px] text-brand-text-muted">
            {taxonomyLabel(locale, product.categories[0].slug, product.categories[0].name)}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-brand-accent-strong">{fmt(displayPrice)}</span>
          {onSale && product.regular_price && (
            <span className="text-[11px] text-brand-text-muted line-through">{fmt(product.regular_price)}</span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">{cartButton}</div>
      </div>

      {/* Desktop: the cart action sits in one column at the bottom-right, clear of
          the remove button in the corner. */}
      <div className="hidden w-[142px] shrink-0 flex-col justify-end gap-1.5 self-stretch sm:flex">
        {cartButton}
        {purchasable && (
          <Link
            href={href}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-brand-border px-3 text-[11px] font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
          >
            {copy.viewProduct}
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={interpolate(copy.removeAria, { name: product.name })}
        className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent-strong"
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </article>
  );
}
