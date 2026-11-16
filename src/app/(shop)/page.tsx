import { MAX_PER_PAGE, getProducts } from '@/lib/api/products';
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
import { EditorialHeading } from '@/components/home/EditorialHeading';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export const revalidate = 60;

export default async function HomePage() {
  // One bounded request keeps the hero mode and featured cards in sync without
  // walking every catalogue page.
  const catalog = await getProducts({ page: 1, per_page: MAX_PER_PAGE })
    .then((result) => result.items)
    .catch(() => null);
  const heroAction = catalog ? getHeroPrimaryAction(catalog) : 'contact';
  const featured = catalog?.slice(0, 4) ?? [];
  const copy = getDictionary(await getLocale()).home.featured;

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
          <EditorialHeading
            id="featured-heading"
            eyebrow={copy.eyebrow}
            title={copy.title}
            action={{ href: '/products', label: copy.action }}
          />

          {featured.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
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
