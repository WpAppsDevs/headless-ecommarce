import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Boxes } from 'lucide-react';
import { PRE_ORDER_WINDOW_DAYS } from '@/lib/delivery';
import { formatRange } from '@/i18n/format';

const PRE_ORDER_WINDOW = formatRange('en', PRE_ORDER_WINDOW_DAYS.min, PRE_ORDER_WINDOW_DAYS.max);

/**
 * The two consumer purchase modes. Catalogue/wholesale is a B2B channel and is
 * carried by the wholesale section further down the page, not by this row.
 */
const PURCHASE_TYPES = [
  {
    icon: ShoppingBag,
    label: 'Ready Stock',
    desc1: 'Fast delivery in 2-5 days',
    desc2: 'across Bangladesh',
    href: '/products?tag=ready-stock',
    image: '/images/category-grid/ready-stock.jpg',
  },
  {
    icon: Boxes,
    label: 'Pre-Order',
    desc1: 'Imported from Pakistan',
    desc2: `Delivery in ${PRE_ORDER_WINDOW} days`,
    href: '/products?tag=pre-order',
    image: '/images/category-grid/pre-order.jpg',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {PURCHASE_TYPES.map(({ icon: Icon, label, desc1, desc2, href, image }) => (
            <Link
              key={label}
              href={href}
              className="group flex min-h-[160px] overflow-hidden rounded-xl bg-brand-card ring-1 ring-brand-border transition-colors hover:bg-brand-accent-light"
              aria-label={`Browse ${label}`}
            >
              {/* Left: content */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                {/* Icon circle */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-accent-light">
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
              <div className="relative w-36 shrink-0 overflow-hidden sm:w-40 lg:w-48">
                <Image
                  src={image}
                  alt={label}
                  fill
                  sizes="(min-width: 1024px) 192px, (min-width: 640px) 160px, 144px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
