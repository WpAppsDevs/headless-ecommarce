import Link from 'next/link';
import { CartPageContent } from '@/components/cart/CartPageContent';
import { RecommendedProducts } from '@/components/cart/RecommendedProducts';
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
      <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-indigo-50 py-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Shopping Cart</h1>
        <nav aria-label="Breadcrumb" className="mt-3">
          <ol className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <li>
              <Link href="/" className="hover:text-zinc-900 transition-colors">
                Homepage
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/products" className="hover:text-zinc-900 transition-colors">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-zinc-700">Shopping Cart</li>
          </ol>
        </nav>
      </div>

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
