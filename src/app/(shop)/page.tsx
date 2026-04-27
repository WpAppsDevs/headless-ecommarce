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
import { NewsletterSection } from '@/components/home/NewsletterSection';

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
      <CategoryGrid />
      <PromoBanners />
      <PreOrderSteps />

      {/* Featured Products */}
      <section aria-labelledby="featured-heading" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
              New Arrivals
            </p>
            <h2 id="featured-heading" className="mt-1 font-serif text-3xl font-bold text-brand-text">
              Latest Collection
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-brand-text underline-offset-4 hover:underline sm:block"
          >
            View all →
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProductsSection />
        </Suspense>
      </section>

      <WholesaleBanner />
      <CategoryBanners />
      <TestimonialsSection />
      <FeaturesStrip />
      <ComingSoonSection />
      <WhatsAppCTA />
      <NewsletterSection />
    </div>
  );
}
