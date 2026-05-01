import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PromoBanners } from '@/components/home/PromoBanners';
import { PreOrderSteps } from '@/components/home/PreOrderSteps';
import { WholesaleBanner } from '@/components/home/WholesaleBanner';
import { CategoryBanners } from '@/components/home/CategoryBanners';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FeaturesStrip } from '@/components/home/FeaturesStrip';
import { ComingSoonSection } from '@/components/home/ComingSoonSection';
import { WhatsAppCTA } from '@/components/home/WhatsAppCTA';

export const revalidate = 60;

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function FeaturedProductsSection() {
  const { items } = await getProducts({ per_page: 4 }).catch(() => ({ items: [] }));
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSlider />
      <CategoryBanners />
      <CategoryGrid />
      {/* <PromoBanners /> */}
      <PreOrderSteps />
      {/* Featured Products */}
      <section aria-labelledby="featured-heading" className="bg-brand-section py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading — matches other section headings */}
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-brand-accent/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
              New Arrivals
            </span>
            <h2 id="featured-heading" className="mt-4 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
              Latest Collection
            </h2>
          </div>

          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <FeaturedProductsSection />
          </Suspense>

          {/* View all — after grid */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-8 py-3 text-sm font-medium text-brand-text transition hover:border-brand-accent/40 hover:text-brand-accent"
            >
              View all products <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <WholesaleBanner />

      <TestimonialsSection />
      <ComingSoonSection />
      <FeaturesStrip />
      <WhatsAppCTA />
    </div>
  );
}
