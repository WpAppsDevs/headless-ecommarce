'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/lib/api/products';

const SIZES = ['S', 'M', 'L', 'XL'];

function ProductCard({ product }: { product: Product }) {
  const { addItem, loading } = useCartStore();
  const image = product.images[0];
  const isOnSale =
    product.on_sale &&
    product.sale_price &&
    product.sale_price !== '' &&
    product.regular_price !== '';
  const discount =
    isOnSale && product.regular_price
      ? Math.round(
          ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) /
            parseFloat(product.regular_price)) *
            100,
        )
      : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white border border-zinc-100">
      {/* Product image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-zinc-50"
        aria-label={`View ${product.name}`}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-zinc-200 uppercase select-none">
            {product.name.charAt(0)}
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Hover overlay — Add to Cart + sizes */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white px-3 py-3 space-y-2 transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product.id, 0, 1);
            }}
            disabled={loading || product.stock_status === 'outofstock'}
            className="w-full rounded-lg border border-zinc-200 py-2 text-xs font-bold uppercase tracking-widest text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white disabled:opacity-50"
          >
            {product.stock_status === 'outofstock' ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <div className="flex justify-center gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={(e) => e.preventDefault()}
                className="text-[10px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Link>

      {/* Product info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          {isOnSale ? (
            <>
              <span className="text-sm font-bold text-zinc-900">${product.sale_price}</span>
              <span className="text-xs font-medium text-zinc-400 line-through">
                ${product.regular_price}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-zinc-900">${product.price}</span>
          )}
        </div>
      </div>
    </article>
  );
}

interface Props {
  products: Product[];
}

export function RecommendedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">You May Also Like</h2>
        <p className="mt-2 text-sm text-zinc-500">Items handpicked for you</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
