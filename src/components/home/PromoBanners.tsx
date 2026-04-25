import Link from 'next/link';

const COLLECTIONS = [
  {
    tag: 'Summer Season',
    title: 'Lawn\nCollection',
    subtitle: 'Breathable, printed lawn suits for the warm season. Cool and elegant.',
    cta: 'Shop Lawn',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&q=80',
    span: 'lg:col-span-2',
  },
  {
    tag: 'Festive Season',
    title: 'Eid\nCollection',
    subtitle: 'Embroidered formals perfect for Eid celebrations.',
    cta: 'Shop Eid',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
    span: '',
  },
  {
    tag: 'Premium',
    title: 'Luxury\nFormals',
    subtitle: 'Hand-crafted embroidery and premium fabrics for special occasions.',
    cta: 'Shop Luxury',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1602573991155-21f0143bb56f?w=600&q=80',
    span: '',
  },
  {
    tag: 'Little Ones',
    title: 'Kids\nCollection',
    subtitle: 'Adorable Pakistani dresses for your little princesses.',
    cta: 'Shop Kids',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=600&q=80',
    span: '',
  },
];

export function PromoBanners() {
  return (
    <section aria-labelledby="collections-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
          Curated for You
        </p>
        <h2 id="collections-heading" className="mt-2 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
          Featured Collections
        </h2>
      </div>

      {/* Grid: 1 large left + 3 small right */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((col, idx) => (
          <Link
            key={col.tag}
            href={col.href}
            className={`group relative overflow-hidden rounded-2xl ${idx === 0 ? 'sm:row-span-2' : ''}`}
            aria-label={`Browse ${col.title.replace('\n', ' ')}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={col.image}
              alt={col.title.replace('\n', ' ')}
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${idx === 0 ? 'h-[480px] sm:h-full' : 'h-56'}`}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/30 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="mb-2 inline-block rounded-full bg-brand-accent px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-dark">
                {col.tag}
              </span>
              <h3 className="whitespace-pre-line font-serif text-2xl font-bold leading-tight text-white">
                {col.title}
              </h3>
              {idx === 0 && (
                <p className="mt-1 max-w-xs text-sm text-white/80">{col.subtitle}</p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-accent underline-offset-2 group-hover:underline">
                {col.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
