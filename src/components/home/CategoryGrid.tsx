import Link from 'next/link';
import { ShoppingBag, Boxes, BookOpen } from 'lucide-react';

const PURCHASE_TYPES = [
  {
    icon: ShoppingBag,
    label: 'Ready Stock',
    desc1: 'Fast delivery in 2-5 days',
    desc2: 'across Bangladesh',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80&fit=crop&crop=center',
  },
  {
    icon: Boxes,
    label: 'Pre-Order',
    desc1: 'Imported from Pakistan',
    desc2: 'Delivery in 10-15 days',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80&fit=crop&crop=top',
  },
  {
    icon: BookOpen,
    label: 'Catalog / Wholesale',
    desc1: 'Bulk buying for resellers',
    desc2: 'Best price guarantee',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80&fit=crop&crop=center',
  },
];

export function CategoryGrid() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {PURCHASE_TYPES.map(({ icon: Icon, label, desc1, desc2, href, image }) => (
            <Link
              key={label}
              href={href}
              className="group flex min-h-[160px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 transition-all hover:-translate-y-1 hover:shadow-md"
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
