import Link from 'next/link';
import { getProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturesStrip } from '@/components/home/FeaturesStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { InstagramSection } from '@/components/home/InstagramSection';

export const revalidate = 60;

export default async function HomePage() {
  const { items: featured } = await getProducts({ per_page: 8 }).catch(
    () => ({ items: [] }),
  );

  return (
    <div className="flex flex-col">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Hero slider */}
      <HeroSlider />

      {/* Features strip */}
      <FeaturesStrip />

      {/* Featured products — "Today's Best Choices" */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Handpicked for You
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Today&apos;s Best Choices</h2>
          <p className="mt-2 text-muted-foreground">
            Discover today&apos;s standout picks.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-8 py-3 text-sm font-semibold transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            View All Products →
          </Link>
        </div>
      </section>

      {/* Shop by categories */}
      <CategoryGrid />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Instagram */}
      <InstagramSection />
    </div>
  );
}

