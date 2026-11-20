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
 * One saved product, sized for a two-column grid.
 *
 * The card stays a row — image left, words right — because that is what keeps
 * the name readable and the height low. The thumbnail is small on purpose: a
 * wishlist is a shortlist to scan, not a catalogue to browse, so the name and
 * the price carry the card and the picture only identifies it.
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
        className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-brand-accent-strong/40 px-2.5 text-[11px] font-semibold text-brand-accent-strong transition-colors hover:bg-brand-accent-light"
      >
        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        {copy.options}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={adding}
        className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-accent-strong px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-70"
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
      aria-disabled="true"
      className="inline-flex min-h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-brand-bg px-2.5 text-[11px] font-semibold text-brand-text-muted"
    >
      {copy.soldOut}
    </button>
  );

  return (
    <article className="group relative flex gap-3 rounded-2xl border border-brand-border bg-white p-2.5">
      <Link
        href={href}
        className="relative block h-[92px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-brand-card"
        aria-label={interpolate(copy.viewAria, { name: product.name })}
        tabIndex={-1}
      >
        <Image
          src={image?.src || PLACEHOLDER}
          alt={image?.alt || product.name}
          fill
          sizes="72px"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            purchasable ? '' : 'opacity-60'
          }`}
        />
        {badge && (
          <span className="absolute left-1 top-1">
            <AvailabilityBadge badge={badge} className="px-1.5 py-0.5 text-[8px] shadow-sm" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col pr-8">
        <Link href={href}>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-brand-text transition-colors hover:text-brand-accent-strong">
            {product.name}
          </h3>
        </Link>

        {product.categories[0] && (
          <p className="mt-0.5 truncate text-[11px] text-brand-text-muted">
            {taxonomyLabel(locale, product.categories[0].slug, product.categories[0].name)}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[13px] font-semibold text-brand-accent-strong">{fmt(displayPrice)}</span>
          {onSale && product.regular_price && (
            <span className="text-[10px] text-brand-text-muted line-through">{fmt(product.regular_price)}</span>
          )}
        </div>

        <div className="mt-auto pt-2">{cartButton}</div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={interpolate(copy.removeAria, { name: product.name })}
        className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent-strong"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </article>
  );
}
