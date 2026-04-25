import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Clock, BookOpen, Truck, Plane, ShieldCheck } from 'lucide-react';

export function HeroSlider() {
  return (
    <section className="relative overflow-hidden bg-white lg:min-h-[580px]">
      {/* Model image — covers right 55% on desktop only */}
      <div className="absolute bottom-0 right-0 top-0 hidden w-[55%] lg:block" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* White-to-transparent fade so text area stays clean */}
        <div className="absolute inset-y-0 left-0 w-56 bg-gradient-to-r from-white to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Mobile image — stacks above text */}
        <div className="relative mt-6 h-72 overflow-hidden rounded-2xl lg:hidden">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
            alt="Premium Pakistani fashion collection"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="py-12 lg:py-16 xl:py-20">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Premium Pakistani Fashion
            </p>

            {/* Headline */}
            <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.1] text-brand-text sm:text-5xl lg:text-5xl xl:text-[3.25rem]">
              Premium Pakistani Dresses<br />
              Stock &amp; Pre-Order Available
            </h1>

            {/* Subtext */}
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-brand-text-muted">
              Shop the latest Pakistani collections in ready stock or pre-order
              your favorite designs directly from Pakistan.
            </p>

            {/* CTA Buttons — stacked on mobile, row on sm+ */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-text px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Ready Stock
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-text px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-brand-text transition hover:bg-brand-text/5"
              >
                <Clock className="h-4 w-4" />
                Pre-Order Collection
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-brand-text-muted transition hover:border-brand-accent hover:text-brand-accent"
              >
                <BookOpen className="h-4 w-4" />
                View Catalog
              </Link>
            </div>

            {/* Trust bar */}
            <div className="mt-7 flex w-full flex-col divide-y divide-brand-border overflow-hidden rounded-2xl border border-brand-border bg-white sm:w-auto sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3 px-5 py-3">
                <Truck className="h-5 w-5 shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-semibold text-brand-text">Fast Delivery</p>
                  <p className="text-xs text-brand-text-muted">2-5 Days (Stock)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3">
                <Plane className="h-5 w-5 shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-semibold text-brand-text">Pre-Order Delivery</p>
                  <p className="text-xs text-brand-text-muted">10-15 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-semibold text-brand-text">100% Original</p>
                  <p className="text-xs text-brand-text-muted">Authentic Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
