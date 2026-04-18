import { getProducts } from '@/lib/api/products';
import type { Product, PaginationMeta } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';

export async function RelatedProducts() {
  const { items } = await getProducts({ per_page: 4 }).catch(
    (): { items: Product[]; meta: PaginationMeta } => ({
      items: [],
      meta: { page: 1, per_page: 4, total: 0, total_pages: 0 },
    }),
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          You may also like
        </p>
        <h2 className="mt-1 text-2xl font-bold text-zinc-900">Related Products</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
