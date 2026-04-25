import Link from 'next/link';
import { Lock } from 'lucide-react';

const BANNERS = [
  {
    label: 'Women',
    tagline: 'Pakistani Dresses for Every Occasion',
    cta: 'Shop Women',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&q=80',
    available: true,
  },
  {
    label: 'Men',
    tagline: 'Shalwar Kameez & Formal Kurtas',
    cta: 'Coming Soon',
    href: null,
    image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=900&q=80',
    available: false,
  },
  {
    label: 'Kids',
    tagline: 'Adorable Pakistani Outfits for Children',
    cta: 'Coming Soon',
    href: null,
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=900&q=80',
    available: false,
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
        {BANNERS.map((b) => {
          const inner = (
            <div className={`group relative overflow-hidden rounded-2xl ${!b.available ? 'opacity-80' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.image}
                alt={b.label}
                className={`h-72 w-full object-cover transition-transform duration-700 ${b.available ? 'group-hover:scale-105' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />

              {/* Coming soon overlay */}
              {!b.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
                    <Lock className="h-5 w-5 text-white/70" />
                    <span className="text-sm font-semibold text-white">Coming Soon</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-2xl font-bold text-white">{b.label}</h3>
                <p className="mt-1 text-sm text-white/70">{b.tagline}</p>
                {b.available && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-accent group-hover:underline underline-offset-2">
                    {b.cta} →
                  </span>
                )}
              </div>
            </div>
          );

          return b.available && b.href ? (
            <Link key={b.label} href={b.href} aria-label={`Shop ${b.label}`}>
              {inner}
            </Link>
          ) : (
            <div key={b.label}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
