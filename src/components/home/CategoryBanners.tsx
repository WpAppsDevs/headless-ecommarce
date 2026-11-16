import Image from 'next/image';
import Link from 'next/link';
import { EditorialHeading } from '@/components/home/EditorialHeading';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { interpolate } from '@/i18n/interpolate';

const BANNERS = [
  { key: 'women', href: '/products?category=women', image: '/images/categories/women.jpg' },
  { key: 'men', href: '/products?category=men', image: '/images/categories/men.jpg' },
  { key: 'kids', href: '/products?category=kids', image: '/images/categories/kids.jpg' },
] as const;

export async function CategoryBanners() {
  const copy = getDictionary(await getLocale()).home.categories;

  return (
    <section
      aria-labelledby="categories-heading"
      className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      {/* Heading */}
      <EditorialHeading
        id="categories-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        action={{ href: '/products', label: copy.action }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {BANNERS.map((banner) => {
          const banner_ = copy[banner.key];

          return (
            <Link
              key={banner.key}
              href={banner.href}
              aria-label={interpolate(copy.shopAria, { label: banner_.label })}
            >
              <div className="group relative h-80 overflow-hidden rounded-xl sm:h-[22rem]">
                <Image
                  src={banner.image}
                  alt={banner_.label}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-2xl font-bold text-white">{banner_.label}</h3>
                  <p className="mt-1 text-sm text-white/70">{banner_.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-white/20">
                    {banner_.cta} →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
