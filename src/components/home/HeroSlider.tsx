import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Clock, BookOpen, Truck, Plane, ShieldCheck } from 'lucide-react';

export function HeroSlider() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-white lg:min-h-[600px]">

      {/* ── Model image — absolute right half, desktop only ── */}
      <div className="absolute bottom-0 right-0 top-0 hidden w-[52%] lg:block" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=90&fit=crop&crop=top"
          alt=""
          fill
          className="object-cover object-[center_top]"
          priority
          sizes="52vw"
        />
        {/* Smooth white fade on the left edge of the image */}
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        {/* ── Mobile image — stacks above text ── */}
        <div className="relative mt-6 h-[280px] overflow-hidden rounded-2xl lg:hidden">
          <Image
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=85&fit=crop&crop=top"
            alt="Premium Pakistani fashion collection"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="py-14 lg:py-16 xl:py-20">
          <div className="max-w-[560px] lg:max-w-[640px] xl:max-w-[720px]">

            {/* Eyebrow */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-wine">
              Premium Pakistani Fashion
            </p>

            {/* Headline — two lines; first line must stay on one line on desktop */}
            <h1 className="mt-4 font-serif text-[2.6rem] font-bold leading-[1.05] text-brand-text sm:text-[3rem] lg:text-[3.4rem] xl:text-[3.7rem]">
              <span className="block whitespace-nowrap">Premium Pakistani Dresses</span>
              <span className="block">Stock &amp; Pre-Order Available</span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-[15px] leading-relaxed text-brand-text-muted">
              Shop the latest Pakistani collections in ready stock<br className="hidden sm:block" />
              or pre-order your favorite designs directly from Pakistan.
            </p>

            {/* ── CTA Buttons — single row, no wrap ── */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-nowrap">
              {/* Filled wine */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-wine px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 whitespace-nowrap"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} />
                Shop Ready Stock
              </Link>
              {/* Outlined wine */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-brand-wine px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-wine transition hover:bg-brand-wine/5 whitespace-nowrap"
              >
                <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
                Pre-Order Collection
              </Link>
              {/* Outlined dark */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-400 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-text transition hover:border-zinc-600 whitespace-nowrap"
              >
                <BookOpen className="h-4 w-4 shrink-0" strokeWidth={2} />
                View Catalog
              </Link>
            </div>

            {/* ── Trust bar: white card with vertical dividers ── */}
            <div className="mt-8 flex w-full flex-col divide-y divide-brand-border overflow-hidden rounded-xl border border-brand-border bg-white sm:w-auto sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Truck className="h-[18px] w-[18px] shrink-0 text-brand-wine/60" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold text-brand-text">Fast Delivery</p>
                  <p className="text-[12px] text-brand-text-muted">2-5 Days (Stock)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Plane className="h-[18px] w-[18px] shrink-0 text-brand-wine/60" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold text-brand-text">Pre-Order Delivery</p>
                  <p className="text-[12px] text-brand-text-muted">10-15 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-brand-wine/60" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold text-brand-text">100% Original</p>
                  <p className="text-[12px] text-brand-text-muted">Authentic Quality</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
