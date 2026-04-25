import Link from 'next/link';
import { ShoppingBag, Boxes, BookOpen } from 'lucide-react';

const PURCHASE_TYPES = [
  {
    icon: ShoppingBag,
    label: 'Ready Stock',
    description: 'Fast delivery in 2-5 days across Bangladesh',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80',
  },
  {
    icon: Boxes,
    label: 'Pre-Order',
    description: 'Imported from Pakistan. Delivery in 10-15 days',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80',
  },
  {
    icon: BookOpen,
    label: 'Catalog / Wholesale',
    description: 'Bulk buying for resellers. Best price guarantee',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80',
  },
];

export function CategoryGrid() {
  return (
    <section aria-labelledby="purchase-types-heading" className="bg-brand-bg py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
            How to Shop With Us
          </p>
          <h2 id="purchase-types-heading" className="mt-2 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
            Choose Your Shopping Style
          </h2>
          <p className="mt-2 text-sm text-brand-text-muted">
            Three ways to get the Pakistani dresses you love, delivered to your door.
          </p>
        </div>

        {/* Cards — horizontal layout matching reference design */}
        <div className="grid gap-5 sm:grid-cols-3">
          {PURCHASE_TYPES.map(({ icon: Icon, label, description, href, image }) => (
            <Link
              key={label}
              href={href}
              className="group flex min-h-[160px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 transition-all hover:-translate-y-1 hover:shadow-md"
              aria-label={`Browse ${label}`}
            >
              {/* Left: content */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-accent/15">
                  <Icon className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-[17px] font-bold text-brand-text">{label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">{description}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-brand-accent">
                  Shop Now <span aria-hidden="true">→</span>
                </span>
              </div>

              {/* Right: image */}
              <div className="relative w-32 shrink-0 overflow-hidden sm:w-28 lg:w-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
