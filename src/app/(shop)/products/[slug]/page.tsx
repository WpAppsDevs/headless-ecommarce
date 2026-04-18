import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Star, Tag, Package } from 'lucide-react';
import { getProduct, getAllProductSlugs } from '@/lib/api/products';
import { ProductImages } from '@/components/product/ProductImages';
import { VariationSelector } from '@/components/product/VariationSelector';
import { ProductTabs } from '@/components/product/ProductTabs';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { ApiError } from '@/lib/errors';

export const revalidate = 60;
export const dynamicParams = true;

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: product.name,
      description: product.short_description?.replace(/<[^>]+>/g, '') ?? '',
    };
  } catch {
    return { title: 'Product' };
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch (e) {
    if (e instanceof ApiError && e.code === 'product_not_found') notFound();
    throw e;
  }

  const isOnSale =
    product.on_sale && product.sale_price && product.sale_price !== product.regular_price;
  const primaryCategory = product.categories[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-xs text-zinc-400">
          <li>
            <Link href="/" className="transition-colors hover:text-zinc-600">
              Home
            </Link>
          </li>
          {primaryCategory && (
            <>
              <li>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link
                  href={`/products?category=${primaryCategory.slug}`}
                  className="transition-colors hover:text-zinc-600"
                >
                  {primaryCategory.name}
                </Link>
              </li>
            </>
          )}
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="max-w-[200px] truncate font-medium text-zinc-600">{product.name}</li>
        </ol>
      </nav>

      {/* 2-col product section */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left: image gallery */}
        <ProductImages images={product.images} name={product.name} isOnSale={!!isOnSale} />

        {/* Right: product info */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          {/* Category pill links */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Name */}
          <h1 className="text-3xl font-bold leading-tight text-zinc-900">{product.name}</h1>

          {/* Static star rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  fill={i <= 4 ? '#f59e0b' : 'none'}
                  stroke={i <= 4 ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="text-sm text-zinc-400">(128 Reviews)</span>
          </div>

          {/* Short description */}
          {product.short_description && (
            <div
              className="text-sm leading-relaxed text-zinc-500 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Variation selector (price, swatches, qty, cart, wishlist, delivery) */}
          <VariationSelector product={product} />

          {/* Product meta */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
            {product.sku && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <span>SKU: {product.sku}</span>
              </div>
            )}
            {product.categories.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                <span>{product.categories.map((c) => c.name).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Below the fold: tabs */}
      <div className="mt-16">
        <ProductTabs
          description={product.description}
          sku={product.sku}
          categories={product.categories}
        />
      </div>

      {/* Related products */}
      <Suspense
        fallback={
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RelatedProducts />
      </Suspense>
    </div>
  );
}
