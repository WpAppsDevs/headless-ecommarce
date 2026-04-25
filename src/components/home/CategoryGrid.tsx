import Link from 'next/link';
import { Zap, Clock, BookOpen } from 'lucide-react';

const PURCHASE_TYPES = [
  {
    icon: Zap,
    label: 'Ready Stock',
    badge: 'Ships Today',
    badgeColor: 'bg-emerald-500',
    description: 'In-stock Pakistani dresses shipped from Bangladesh warehouse. Receive in 2–5 business days.',
    deliveryNote: '2–5 Days Delivery',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
  },
  {
    icon: Clock,
    label: 'Pre-Order',
    badge: 'From Pakistan',
    badgeColor: 'bg-brand-preorder',
    description: 'Exclusive designs imported fresh from Pakistan. Place your order and we\'ll bring it for you in 10–15 days.',
    deliveryNote: '10–15 Days Delivery',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
  },
  {
    icon: BookOpen,
    label: 'Catalog / Wholesale',
    badge: 'Bulk Orders',
    badgeColor: 'bg-zinc-700',
    description: 'Browse our full catalog for resellers and wholesalers. Minimum order quantities apply.',
    deliveryNote: 'Contact for Pricing',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  },
];

export function CategoryGrid() {
  return (
    <section aria-labelledby="purchase-types-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            How to Shop With Us
          </p>
          <h2 id="purchase-types-heading" className="mt-2 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
            Choose Your Shopping Style
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Three ways to get the Pakistani dresses you love, delivered to your door.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {PURCHASE_TYPES.map(({ icon: Icon, label, badge, badgeColor, description, deliveryNote, href, image }) => (
            <Link
              key={label}
              href={href}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 transition-all hover:-translate-y-1 hover:shadow-lg"
              aria-label={`Browse ${label}`}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeColor}`}>
                  {badge}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/10">
                    <Icon className="h-4 w-4 text-brand-accent" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-text">{label}</h3>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-zinc-500">{description}</p>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-xs font-medium text-brand-accent">{deliveryNote}</span>
                  <span className="text-xs font-semibold text-brand-text group-hover:underline">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
