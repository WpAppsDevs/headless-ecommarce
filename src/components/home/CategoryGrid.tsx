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
    <section aria-labelledby="categories-heading" className="bg-zinc-50 dark:bg-zinc-900/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Collections
            </p>
            <h2 id="categories-heading" className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-zinc-500 underline-offset-4 hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        {/* Scroll container on mobile, grid on desktop */}
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative shrink-0 w-44 overflow-hidden rounded-2xl bg-zinc-100 sm:w-auto"
              aria-label={`Browse ${cat.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-bold text-white">{cat.name}</p>
                <p className="mt-0.5 text-xs text-white/60">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

