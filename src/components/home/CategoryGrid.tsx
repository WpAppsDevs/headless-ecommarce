import Link from 'next/link';
import { ShoppingBag, Boxes, BookOpen } from 'lucide-react';

const PURCHASE_TYPES = [
  {
    icon: ShoppingBag,
    label: 'Ready Stock',
    desc1: 'Fast delivery in 2-5 days',
    desc2: 'across Bangladesh',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1733731402878-09226b46c4f1?w=400&q=85&fit=crop',
    catalog: false,
  },
  {
    icon: Boxes,
    label: 'Pre-Order',
    desc1: 'Imported from Pakistan',
    desc2: 'Delivery in 15-25 days',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1733209773389-6a37a36761c5?w=400&q=85&fit=crop',
    catalog: false,
  },
  {
    icon: BookOpen,
    label: 'Catalog / Wholesale',
    desc1: 'Bulk buying for resellers',
    desc2: 'Best price guarantee',
    href: '/products',
    image: '',
    catalog: true,
  },
];

const CATALOG_IMAGES = [
  'https://images.unsplash.com/photo-1733731402680-50c115b0c5b3?w=200&q=80&fit=crop',
  'https://images.unsplash.com/photo-1733209484732-6b094322a89f?w=200&q=80&fit=crop',
  'https://images.unsplash.com/photo-1733731406510-d2f6405c85dc?w=200&q=80&fit=crop',
];

export function CategoryGrid() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {PURCHASE_TYPES.map(({ icon: Icon, label, desc1, desc2, href, image, catalog }) => (
            <Link
              key={label}
              href={href}
              className="group flex min-h-[160px] overflow-hidden rounded-2xl bg-brand-card shadow-sm ring-1 ring-brand-border transition-all hover:-translate-y-1 hover:shadow-md"
              aria-label={`Browse ${label}`}
            >
              {/* Left: content */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                {/* Icon circle */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-accent/20">
                  <Icon className="h-5 w-5 text-brand-wine" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-serif text-[17px] font-bold text-brand-text">{label}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-brand-text-muted">
                    {desc1}<br />{desc2}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-wine">
                  Shop Now <span aria-hidden="true">→</span>
                </span>
              </div>

              {/* Right: product image */}
              <div className="relative w-32 shrink-0 overflow-hidden sm:w-28 lg:w-36">
                {catalog ? (
                  /* Catalog: polaroid-style overlapping photos */
                  <div className="relative flex h-full w-full items-center justify-center bg-brand-accent/5 p-2">
                    {CATALOG_IMAGES.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="absolute h-[75%] w-[55%] rounded-sm object-cover shadow-md ring-2 ring-white"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${(i - 1) * 9}deg) translate(${(i - 1) * 18}px, ${i === 1 ? -4 : 4}px)`,
                          zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
