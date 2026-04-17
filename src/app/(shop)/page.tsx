import Link from 'next/link';
import { getProducts } from '@/lib/api/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { config } from '@/lib/config';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const { items: featured } = await getProducts({ per_page: 8 }).catch(
    () => ({ items: [] }),
  );

  const { hero } = config;

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href={hero.ctaLink}
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              {hero.ctaText}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline"
          >
            Shop All →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
