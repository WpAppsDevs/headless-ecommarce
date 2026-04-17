import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Tops',
    slug: 'tops',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    count: '120+ styles',
  },
  {
    name: 'Bottoms',
    slug: 'bottoms',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
    count: '80+ styles',
  },
  {
    name: 'Outerwear',
    slug: 'outerwear',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    count: '60+ styles',
  },
  {
    name: 'Activewear',
    slug: 'activewear',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    count: '90+ styles',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    count: '150+ items',
  },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Collections
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">Shop By Categories</h2>
        <p className="mt-2 text-muted-foreground">
          Explore essential activewear collections for every workout style.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-zinc-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat.image}
              alt={cat.name}
              className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="font-semibold leading-tight">{cat.name}</p>
              <p className="mt-0.5 text-xs text-white/70">{cat.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
