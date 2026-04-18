import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const BANNERS = [
  {
    tag: 'Just Dropped',
    title: 'New\nArrivals',
    subtitle: 'Fresh styles added every week. Be the first to shop.',
    cta: 'Shop New Arrivals',
    href: '/products?category=new-arrivals',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=80',
    light: false,
  },
  {
    tag: 'Limited Time',
    title: 'Up to 40%\nOff Sale',
    subtitle: 'Premium picks at unbeatable prices. While stocks last.',
    cta: 'Shop the Sale',
    href: '/products?on_sale=true',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
    light: true,
  },
];

export function PromoBanners() {
  return (
    <section
      aria-label="Promotional banners"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {BANNERS.map((b) => (
          <div
            key={b.tag}
            className="group relative overflow-hidden rounded-3xl"
          >
            {/* Background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image}
              alt=""
              aria-hidden="true"
              className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Gradient overlay */}
            <div
              className={cn(
                'absolute inset-0',
                b.light
                  ? 'bg-gradient-to-r from-white/85 via-white/60 to-transparent'
                  : 'bg-gradient-to-r from-zinc-950/80 via-zinc-950/50 to-transparent',
              )}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 py-8">
              <span
                className={cn(
                  'mb-2 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest',
                  b.light
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white/20 text-white backdrop-blur-sm',
                )}
              >
                {b.tag}
              </span>
              <h3
                className={cn(
                  'whitespace-pre-line text-3xl font-extrabold leading-tight sm:text-4xl',
                  b.light ? 'text-zinc-900' : 'text-white',
                )}
              >
                {b.title}
              </h3>
              <p
                className={cn(
                  'mt-2 max-w-xs text-sm',
                  b.light ? 'text-zinc-600' : 'text-white/80',
                )}
              >
                {b.subtitle}
              </p>
              <Link
                href={b.href}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'mt-5 w-fit rounded-full px-6',
                  b.light
                    ? 'bg-zinc-900 text-white hover:bg-zinc-700'
                    : 'bg-white text-zinc-900 hover:bg-zinc-100',
                )}
              >
                {b.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
