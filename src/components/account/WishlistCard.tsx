'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ShoppingBag, Trash2 } from 'lucide-react';
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

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-brand-border bg-white transition-colors hover:border-brand-accent-strong/40">
      <Link
        href={href}
        className="relative block aspect-[3/4] overflow-hidden bg-brand-card"
        aria-label={interpolate(copy.viewAria, { name: product.name })}
        tabIndex={-1}
      >
        <Image
          src={image?.src || PLACEHOLDER}
          alt={image?.alt || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-2 top-2">
            <AvailabilityBadge badge={badge} className="px-2.5 py-1 text-[10px] tracking-[0.08em] shadow-sm" />
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={onRemove}
        aria-label={interpolate(copy.removeAria, { name: product.name })}
        className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-brand-text-muted shadow-sm transition-colors hover:text-brand-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent-strong"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-text transition-colors hover:text-brand-accent-strong sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {product.categories[0] && (
          <p className="truncate text-xs text-brand-text-muted">
            {taxonomyLabel(locale, product.categories[0].slug, product.categories[0].name)}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
          <span className="text-base font-bold text-brand-accent-strong">{fmt(displayPrice)}</span>
          {onSale && product.regular_price && (
            <span className="text-xs text-brand-text-muted line-through">{fmt(product.regular_price)}</span>
          )}
        </div>

        {!purchasable ? (
          <button
            type="button"
            disabled
            className="mt-2 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-3 text-xs font-semibold text-brand-text"
          >
            {copy.soldOut}
          </button>
        ) : product.type === 'variable' ? (
          <Link
            href={href}
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-brand-accent-strong/40 px-3 text-xs font-semibold text-brand-accent-strong transition-colors hover:bg-brand-accent-light"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            {copy.options}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={adding}
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-accent-strong px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-70"
          >
            {adding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            )}
            {adding ? copy.adding : copy.addToCart}
          </button>
        )}
      </div>
    </article>
  );
}
