'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Loader2, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { apiGetWishlist } from '@/lib/api/wishlist';
import { ApiError } from '@/lib/errors';
import type { Product } from '@/lib/api/products';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23FBF7F5%22/%3E%3C/svg%3E';

// ---------------------------------------------------------------------------
// Wishlist product card
// ---------------------------------------------------------------------------

function WishlistProductCard({ product, onRemove }: { product: Product; onRemove: () => void }) {
  const image = product.images[0];
  const price = product.sale_price || product.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-brand-card"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        <Image
          src={image?.src || PLACEHOLDER}
          alt={image?.alt || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.name} from wishlist`}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-zinc-400 transition-colors hover:text-rose-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 text-sm font-bold text-brand-text transition-colors hover:text-brand-wine sm:text-base">
            {product.name}
          </h3>
        </Link>

        {product.categories[0] && (
          <p className="text-xs text-brand-text-muted">{product.categories[0].name}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-brand-wine">${price}</span>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.type === 'variable' ? 'Options' : 'Buy'}
          </Link>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
        <Heart className="h-9 w-9 text-zinc-300" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900">Your wishlist is empty</h2>
        <p className="text-sm text-zinc-500">Tap the heart icon on any product to save it here.</p>
      </div>
      <Link
        href="/products"
        className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        Browse Products
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wishlist tab (used inside AccountLayout — user is always authenticated here)
// ---------------------------------------------------------------------------

export function WishlistTab() {
  const { remove } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { products: items } = await apiGetWishlist(1, 100);
        setProducts(items);
      } catch (e) {
        if (e instanceof ApiError) {
          setError(e.message || 'Failed to load wishlist.');
        } else {
          setError('Failed to load wishlist. Please try again.');
        }
      } finally {
        setReady(true);
      }
    }
    void load();
  }, []);

  async function handleRemove(productId: number) {
    await remove(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  const heading = ready && products.length > 0 ? `Wishlist (${products.length})` : 'Wishlist';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">{heading}</h2>

      {!ready && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      )}

      {ready && error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}

      {ready && !error && products.length === 0 && <EmptyWishlist />}

      {ready && !error && products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <WishlistProductCard
              key={product.id}
              product={product}
              onRemove={() => void handleRemove(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
