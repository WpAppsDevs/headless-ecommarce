import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Clock, BookOpen, Truck, Plane, ShieldCheck } from 'lucide-react';

export function HeroSlider() {
  return (
    <section className="relative min-h-[500px] overflow-hidden bg-brand-bg lg:min-h-[580px]">
      {/* ── Model image — right 55%, desktop only ── */}
      <div className="absolute bottom-0 right-0 top-0 hidden w-[55%] lg:block" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* Seamless blend: fade from page bg → transparent */}
        <div className="absolute inset-y-0 left-0 w-72 bg-gradient-to-r from-brand-bg to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* ── Mobile image: stacks above text ── */}
        <div className="relative mt-6 h-[260px] overflow-hidden rounded-2xl lg:hidden">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
            alt="Premium Pakistani fashion collection"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="py-12 lg:py-16 xl:py-20">
          <div className="max-w-[540px]">

            {/* Eyebrow */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-accent">
              Premium Pakistani Fashion
            </p>

            {/* Headline — large serif 2-line */}
            <h1 className="mt-3 font-serif text-[2.4rem] font-bold leading-[1.1] text-brand-text sm:text-[2.8rem] lg:text-[3rem] xl:text-[3.4rem]">
              Premium Pakistani Dresses<br />
              Stock &amp; Pre-Order Available
            </h1>

            {/* Subtext */}
            <p className="mt-4 text-[15px] leading-relaxed text-brand-text-muted">
              Shop the latest Pakistani collections in ready stock<br className="hidden sm:block" />
              or pre-order your favorite designs directly from Pakistan.
            </p>

            {/* ── CTA Buttons ── */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Filled wine */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-brand-wine px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-90"
              >
                <ShoppingBag className="h-[15px] w-[15px]" strokeWidth={1.8} />
                Shop Ready Stock
              </Link>
              {/* Outlined wine */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg border-2 border-brand-wine px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-brand-wine transition hover:bg-brand-wine/5"
              >
                <Clock className="h-[15px] w-[15px]" strokeWidth={1.8} />
                Pre-Order Collection
              </Link>
              {/* Outlined dark */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-brand-text/70 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-brand-text transition hover:border-brand-text"
              >
                <BookOpen className="h-[15px] w-[15px]" strokeWidth={1.8} />
                View Catalog
              </Link>
            </div>

            {/* ── Trust bar: white rounded card with icon + text + dividers ── */}
            <div className="mt-7 flex w-full flex-col divide-y divide-brand-border overflow-hidden rounded-xl border border-brand-border bg-white sm:w-auto sm:flex-row sm:divide-x sm:divide-y-0">
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
