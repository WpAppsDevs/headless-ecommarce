import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api/products';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23FBF7F5%22/%3E%3C/svg%3E';

function StarRating({ score = 4.5 }: { score?: number }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${score} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <defs>
            <linearGradient id={`star-${i}-${score}`}>
              <stop
                offset={i < full ? '100%' : i === full && half ? '50%' : '0%'}
                stopColor="#facc15"
              />
              <stop
                offset={i < full ? '100%' : i === full && half ? '50%' : '0%'}
                stopColor="#e5e7eb"
              />
            </linearGradient>
          </defs>
          <path
            fill={i < full ? '#facc15' : i === full && half ? 'url(#star-' + i + '-' + score + ')' : '#e5e7eb'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
      <span className="ml-1 text-xs text-brand-text-muted">{score}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const hoverImage = product.images[1];
  const isOnSale =
    product.on_sale && product.sale_price && product.sale_price !== product.regular_price;
  const isNew = !product.on_sale;

  const discount =
    isOnSale && product.regular_price
      ? Math.round(
          ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) /
            parseFloat(product.regular_price)) *
            100,
        )
      : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-section shadow-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-brand-card"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={image?.url ?? PLACEHOLDER}
          alt={image?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-all duration-500',
            hoverImage
              ? 'group-hover:opacity-0'
              : 'group-hover:scale-105',
          )}
        />
        {hoverImage && (
          <Image
            src={hoverImage.url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isOnSale && discount > 0 && (
            <Badge className="rounded-full bg-brand-wine px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-none hover:bg-brand-wine">
              -{discount}%
            </Badge>
          )}
          {isNew && (
            <Badge className="rounded-full bg-brand-dark px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-none hover:bg-brand-dark">
              NEW
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-text-muted opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:text-brand-wine group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick View overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Link
            href={`/products/${product.slug}`}
            className="flex w-full items-center justify-center gap-2 bg-brand-dark/95 py-3 text-sm font-medium text-white backdrop-blur-sm hover:bg-brand-dark"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`} className="group/name">
          <h3 className="line-clamp-1 text-sm font-semibold text-brand-text transition-colors group-hover/name:text-brand-accent">
            {product.name}
          </h3>
        </Link>

        <StarRating />

        <div className="flex items-baseline gap-2">
          {isOnSale ? (
            <>
              <span className="text-base font-bold text-brand-text">${product.sale_price}</span>
              <span className="text-sm text-brand-text-muted line-through">${product.regular_price}</span>
            </>
          ) : (
            <span className="text-base font-bold text-brand-text">${product.price}</span>
          )}
        </div>
      </div>
    </article>
  );
}

