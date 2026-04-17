import { notFound } from 'next/navigation';
import { getProduct, getAllProductSlugs } from '@/lib/api/products';
import { ProductImages } from '@/components/product/ProductImages';
import { VariationSelector } from '@/components/product/VariationSelector';
import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/lib/errors';

export const revalidate = 60;
export const dynamicParams = true; // on-demand ISR for slugs not pre-built at deploy

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

  const isVariableProduct = product.type === 'variable' && product.variations.length > 0;
  const isOnSale =
    product.on_sale && product.sale_price && product.sale_price !== product.regular_price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* ── Image gallery ─────────────────────────────────────────────── */}
        <ProductImages images={product.images} name={product.name} />

        {/* ── Product info ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Category badges */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Name */}
          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

          {/* Base price — only shown for simple products (variables show price per variation) */}
          {!isVariableProduct && (
            <div className="flex items-baseline gap-3">
              {isOnSale ? (
                <>
                  <span className="text-2xl font-semibold">${product.sale_price}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.regular_price}
                  </span>
                  <Badge variant="destructive">Sale</Badge>
                </>
              ) : (
                <span className="text-2xl font-semibold">${product.price}</span>
              )}
            </div>
          )}

          {/* Short description */}
          {product.short_description && (
            <div
              className="text-muted-foreground [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Variation selector + Add to Cart */}
          <VariationSelector product={product} />

          {/* Full description */}
          {product.description && (
            <>
              <hr className="border-border" />
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
