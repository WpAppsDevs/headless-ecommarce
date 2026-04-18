import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturesStrip } from '@/components/home/FeaturesStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PromoBanners } from '@/components/home/PromoBanners';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { InstagramSection } from '@/components/home/InstagramSection';
import { Flame, Zap } from 'lucide-react';

export const revalidate = 60;

// ── Skeleton grid ────────────────────────────────────────────────────────────
function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  viewAllHref?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {eyebrow}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="hidden text-sm font-medium text-zinc-500 underline-offset-4 hover:underline sm:block"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

// ── Product section ──────────────────────────────────────────────────────────
async function FeaturedProductsSection() {
  const { items } = await getProducts({ per_page: 8 }).catch(() => ({ items: [] }));
  if (items.length === 0) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-semibold shadow-sm transition hover:bg-zinc-50 hover:shadow"
        >
          View All Products →
        </Link>
      </div>
    </>
  );
}

async function TrendingProductsSection() {
  const { items } = await getProducts({ per_page: 4 }).catch(() => ({ items: [] }));
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Hero slider */}
      <HeroSlider />

      {/* Features strip */}
      <FeaturesStrip />

      {/* ── Today's Best Choices ── */}
      <section aria-labelledby="featured-heading" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Handpicked for You"
          title="Today's Best Choices"
          subtitle="Discover today's standout picks."
          icon={Flame}
          viewAllHref="/products"
        />
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProductsSection />
        </Suspense>
      </section>

      {/* Promo banners */}
      <PromoBanners />

      {/* Shop by categories */}
      <CategoryGrid />

      {/* ── Trending Now ── */}
      <section aria-labelledby="trending-heading" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What's hot"
          title="Trending Now"
          subtitle="Our most-loved styles this season."
          icon={Zap}
          viewAllHref="/products"
        />
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <TrendingProductsSection />
        </Suspense>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />

      {/* Instagram */}
      <InstagramSection />
    </main>
  );
}


