import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/home/SectionHeading';

const BANNERS = [
  {
    label: 'Women',
    tagline: 'Pakistani Dresses for Every Occasion',
    cta: 'Shop Women',
    href: '/products?category=women',
    image: '/images/categories/women.jpg',
  },
  {
    label: 'Men',
    tagline: 'Shalwar Kameez & Formal Kurtas',
    cta: 'Shop Men',
    href: '/products?category=men',
    image: '/images/categories/men.jpg',
  },
  {
    label: 'Kids',
    tagline: 'Adorable Pakistani Outfits for Children',
    cta: 'Shop Kids',
    href: '/products?category=kids',
    image: '/images/categories/kids.jpg',
  },
];

export function CategoryBanners() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      {/* Heading */}
      <SectionHeading
        id="categories-heading"
        eyebrow="Shop by Category"
        title="For the Whole Family"
        action={{ href: '/products', label: 'All products' }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {BANNERS.map((b) => (
          <Link key={b.label} href={b.href} aria-label={`Shop ${b.label}`}>
            <div className="group relative h-80 overflow-hidden rounded-xl sm:h-[22rem]">
              <Image
                src={b.image}
                alt={b.label}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-serif text-2xl font-bold text-white">{b.label}</h3>
                <p className="mt-1 text-sm text-white/70">{b.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-white/20">
                  {b.cta} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
