import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { getProduct, getAllProductSlugs } from '@/lib/api/products';
import { getRatingAggregate } from '@/lib/api/reviews';
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

  // Fetch rating aggregate in parallel with product; used for JSON-LD + Reviews tab
  const ratingAggregate = await getRatingAggregate(product.id);

  const isOnSale =
    product.on_sale && product.sale_price && product.sale_price !== product.regular_price;
  const primaryCategory = product.categories[0];

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      {ratingAggregate && ratingAggregate.total_reviews > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              image: product.images[0]?.src,
              description: product.short_description?.replace(/<[^>]+>/g, '') ?? '',
              sku: product.sku,
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: ratingAggregate.average_rating.toFixed(1),
                reviewCount: ratingAggregate.total_reviews,
                bestRating: '5',
                worstRating: '1',
              },
            }),
          }}
        />
      )}
      <PageHeader
        title={product.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/products' },
          ...(primaryCategory
            ? [{ label: primaryCategory.name, href: `/products?category=${primaryCategory.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <section className="bg-[#FBF7F3]">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* 2-col product section */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,48%)_1fr] lg:gap-12">
            {/* Left: image gallery */}
            <ProductImages images={product.images} name={product.name} isOnSale={!!isOnSale} />

            {/* Right: product info */}
            <div className="flex flex-col gap-5">
              {/* Category pill links */}
              {product.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="rounded-full bg-[#F6E4E4] px-3 py-1 text-xs font-medium text-[#7A2E3A] transition-colors hover:bg-[#EFD5D5]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Name */}
              <h1 className="font-serif text-2xl uppercase leading-tight tracking-wide text-[#1F2A3C] lg:text-[32px]">
                {product.name}
              </h1>

              {/* Rating + Product Code */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                {(product.rating_count ?? 0) > 0 ? (
                  <>
                    <span className="flex items-center gap-0.5" aria-label={`${product.average_rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((i) => {
                        const avg = parseFloat(product.average_rating ?? '0');
                        const filled = i <= Math.floor(avg);
                        const half = !filled && i === Math.ceil(avg) && avg % 1 >= 0.5;
                        return (
                          <Star
                            key={i}
                            className="h-4 w-4"
                            fill={filled || half ? '#9E2F45' : 'none'}
                            stroke={filled || half ? '#9E2F45' : '#D9D2CB'}
                          />
                        );
                      })}
                    </span>
                    <span className="text-[#5A5A5A]">{product.average_rating} / 5</span>
                    <span className="text-[#5A5A5A]">({product.rating_count} Reviews)</span>
                  </>
                ) : (
                  <a
                    href="#reviews"
                    className="font-medium text-[#9E2F45] underline underline-offset-2 hover:text-[#862640]"
                  >
                    Be the first to review
                  </a>
                )}

                {product.sku && (
                  <>
                    <span aria-hidden="true" className="h-4 w-px bg-[#D9D2CB]" />
                    <span className="text-[#5A5A5A]">Product Code: {product.sku}</span>
                  </>
                )}
              </div>

              {/* Short description */}
              {product.short_description && (
                <div
                  className="font-ui text-sm leading-relaxed text-[#5A5A5A] [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {/* Variation selector (price, swatches, qty, cart, wishlist) */}
              <VariationSelector product={product} />
            </div>
          </div>

          {/* Below the fold: accordions */}
          <div className="mt-12">
            <ProductTabs
              description={product.description}
              productDetails={product.product_details}
              sku={product.sku}
              categories={product.categories}
              productId={product.id}
              productName={product.name}
              initialAggregate={ratingAggregate}
            />
          </div>
        </div>
      </section>

      {/* Related products (unchanged) */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
    </>
  );
}
