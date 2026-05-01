import Link from 'next/link';

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
    <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
          Shop by Category
        </p>
        <h2 id="categories-heading" className="mt-2 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
          For the Whole Family
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {BANNERS.map((b) => (
          <Link key={b.label} href={b.href} aria-label={`Shop ${b.label}`}>
            <div className="group relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.image}
                alt={b.label}
                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-2xl font-bold text-white">{b.label}</h3>
                <p className="mt-1 text-sm text-white/70">{b.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-accent group-hover:underline underline-offset-2">
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
