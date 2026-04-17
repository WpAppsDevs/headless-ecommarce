import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/api/products';

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f1f5f9%22/%3E%3C/svg%3E';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const isOnSale = product.on_sale && product.sale_price && product.sale_price !== product.regular_price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image?.url ?? PLACEHOLDER}
          alt={image?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isOnSale && (
          <Badge className="absolute left-2 top-2" variant="destructive">
            Sale
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-auto flex items-baseline gap-2">
          {isOnSale ? (
            <>
              <span className="font-semibold text-foreground">${product.sale_price}</span>
              <span className="text-xs text-muted-foreground line-through">
                ${product.regular_price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-foreground">${product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
