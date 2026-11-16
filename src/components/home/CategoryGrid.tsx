import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Boxes } from 'lucide-react';
import { PRE_ORDER_WINDOW_DAYS, READY_STOCK_WINDOW_DAYS } from '@/lib/delivery';
import { formatRange } from '@/i18n/format';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { interpolate } from '@/i18n/interpolate';

/**
 * The two consumer purchase modes. Catalogue/wholesale is a B2B channel and is
 * carried by the wholesale section further down the page, not by this row.
 */
const PURCHASE_TYPES = [
  {
    key: 'readyStock',
    icon: ShoppingBag,
    href: '/products?tag=ready-stock',
    image: '/images/category-grid/ready-stock.jpg',
    window: 'readyStock',
  },
  {
    key: 'preOrder',
    icon: Boxes,
    href: '/products?tag=pre-order',
    image: '/images/category-grid/pre-order.jpg',
    window: 'preOrder',
  },
] as const;

export async function CategoryGrid() {
  const locale = await getLocale();
  const copy = getDictionary(locale).home.purchaseTypes;
  const windows = {
    readyStock: formatRange(locale, READY_STOCK_WINDOW_DAYS.min, READY_STOCK_WINDOW_DAYS.max),
    preOrder: formatRange(locale, PRE_ORDER_WINDOW_DAYS.min, PRE_ORDER_WINDOW_DAYS.max),
  };

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {PURCHASE_TYPES.map(({ key, icon: Icon, href, image, window }) => {
            const label = copy[key].label;
            const window_ = windows[window];

            return (
              <Link
                key={key}
                href={href}
                className="group flex min-h-[160px] overflow-hidden rounded-xl bg-brand-card ring-1 ring-brand-border transition-colors hover:bg-brand-accent-light"
                aria-label={interpolate(copy.browseAria, { label })}
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
                      {interpolate(copy[key].desc1, { window: window_ })}
                      <br />
                      {interpolate(copy[key].desc2, { window: window_ })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-wine">
                    {copy.shopNow} <span aria-hidden="true">→</span>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
