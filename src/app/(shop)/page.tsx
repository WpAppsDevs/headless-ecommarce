import Link from 'next/link';
import { getAllProducts } from '@/lib/api/products';
import { getHeroPrimaryAction } from '@/lib/product-availability';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PreOrderSteps } from '@/components/home/PreOrderSteps';
import { WholesaleBanner } from '@/components/home/WholesaleBanner';
import { CategoryBanners } from '@/components/home/CategoryBanners';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FeaturesStrip } from '@/components/home/FeaturesStrip';
import { ComingSoonSection } from '@/components/home/ComingSoonSection';
import { WhatsAppCTA } from '@/components/home/WhatsAppCTA';

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await getAllProducts().catch(() => null);
  const heroAction = catalog ? getHeroPrimaryAction(catalog) : 'ready-stock';
  const featured = catalog?.slice(0, 4) ?? [];

  return (
    <div className="flex flex-col">
      <HeroSlider primaryAction={heroAction} />
      <CategoryBanners />
      <CategoryGrid />
      <PreOrderSteps />
      {/* Featured Products */}
      <section aria-labelledby="featured-heading" className="bg-brand-section py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading — matches other section headings */}
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-brand-accent/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent-strong">
              New Arrivals
            </span>
            <h2 id="featured-heading" className="mt-4 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
              Latest Collection
            </h2>
          </div>

          {featured.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* View all — after grid */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-8 py-3 text-sm font-medium text-brand-text transition hover:border-brand-accent/40 hover:text-brand-accent-strong"
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
