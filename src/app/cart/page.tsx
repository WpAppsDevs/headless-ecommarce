import { CartPageContent } from '@/components/cart/CartPageContent';
import { RecommendedProducts } from '@/components/cart/RecommendedProducts';
import { PageHeader } from '@/components/ui/PageHeader';
import { getProducts } from '@/lib/api/products';
import type { Product } from '@/lib/api/products';

export const metadata = {
  title: 'Shopping Cart',
};

export default async function CartPage() {
  let recommended: Product[] = [];
  try {
    const { items } = await getProducts({ per_page: 4 });
    recommended = items;
  } catch {
    // Non-critical — recommendations silently degrade
  }

  return (
    <>
      {/* Page header */}
      <PageHeader
        title="Shopping Cart"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Shop', href: '/products' },
          { label: 'Shopping Cart' },
        ]}
      />

      {/* Cart content (client — requires cart store) */}
      <CartPageContent />

      {/* Recommended products (server-fetched) */}
      {recommended.length > 0 && (
        <div className="border-t border-zinc-100">
          <RecommendedProducts products={recommended} />
        </div>
      )}
    </>
  );
}
