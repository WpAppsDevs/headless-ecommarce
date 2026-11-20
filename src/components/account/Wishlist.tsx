'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/stores/wishlistStore';
import { apiGetWishlist } from '@/lib/api/wishlist';
import type { Product } from '@/lib/api/products';
import { useDictionary } from '@/i18n/LocaleProvider';
import { interpolate } from '@/i18n/interpolate';
import { WishlistCard } from './WishlistCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountHeading } from './AccountHeading';

function WishlistSkeleton() {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-3 sm:gap-4 sm:p-3.5">
          <Skeleton className="h-[96px] w-[76px] shrink-0 rounded-xl sm:h-[116px] sm:w-[92px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyWishlist() {
  const copy = useDictionary().account.wishlist;

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-brand-border bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent-light">
        <Heart className="h-7 w-7 text-brand-accent-strong" strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-brand-text">{copy.emptyTitle}</h2>
        <p className="max-w-sm text-sm text-brand-text-muted">{copy.emptyBody}</p>
      </div>
      <Link
        href="/products"
        className="inline-flex min-h-11 items-center rounded-lg bg-brand-accent-strong px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover"
      >
        {copy.browseProducts}
      </Link>
    </div>
  );
}

export function WishlistTab() {
  const copy = useDictionary().account.wishlist;
  const remove = useWishlistStore((s) => s.remove);
  const toggle = useWishlistStore((s) => s.toggle);
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  // A flag, not the sentence, so a language switch fixes a visible message
  // without refetching the wishlist.
  const [failed, setFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiGetWishlist(1, 100)
      .then(({ products: items }) => {
        if (cancelled) return;
        setProducts(items);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /**
   * Removal is optimistic and undoable. The card leaves the grid at once; if
   * the server refuses, the store restores it and the toast never appears, so
   * an "Undo" is only ever offered for a removal that happened.
   */
  const handleRemove = useCallback(
    async (product: Product) => {
      const index = products.findIndex((item) => item.id === product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));

      await remove(product.id);

      if (useWishlistStore.getState().ids.includes(product.id)) {
        setProducts((prev) => {
          if (prev.some((item) => item.id === product.id)) return prev;
          const next = [...prev];
          next.splice(Math.max(0, Math.min(index, next.length)), 0, product);
          return next;
        });
        return;
      }

      toast(copy.removed, {
        duration: 6000,
        action: {
          label: copy.undo,
          onClick: () => {
            void (async () => {
              await toggle(product.id, product.name, { silent: true });
              if (!useWishlistStore.getState().ids.includes(product.id)) return;
              setProducts((prev) => {
                if (prev.some((item) => item.id === product.id)) return prev;
                const next = [...prev];
                next.splice(Math.max(0, Math.min(index, next.length)), 0, product);
                return next;
              });
            })();
          },
        },
      });
    },
    [copy.removed, copy.undo, products, remove, toggle],
  );

  const heading =
    ready && products.length > 0
      ? interpolate(copy.headingCount, { count: products.length })
      : copy.heading;

  return (
    <div className="space-y-4">
      <AccountHeading title={heading} description={copy.subtitle} />

      {!ready && <WishlistSkeleton />}

      {ready && failed && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white px-6 py-12 text-center">
          <p className="text-sm text-brand-text-muted">{copy.failed}</p>
          <button
            type="button"
            onClick={() => {
              setReady(false);
              setFailed(false);
              setReloadToken((token) => token + 1);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border px-4 text-sm font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
          >
            <RotateCw className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            {copy.retry}
          </button>
        </div>
      )}

      {ready && !failed && products.length === 0 && <EmptyWishlist />}

      {ready && !failed && products.length > 0 && (
        <div className="space-y-2.5">
          {products.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={() => void handleRemove(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
