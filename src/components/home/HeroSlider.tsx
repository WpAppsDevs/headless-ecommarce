import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Package } from 'lucide-react';

export function HeroSlider() {
  return (
    <section className="relative bg-brand-bg">
      {/* Decorative blobs — contained so they never cause scrollbars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-[560px] w-[560px] rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full bg-brand-accent-light/70 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 py-14 lg:flex-row lg:items-center lg:gap-14 lg:py-20 xl:py-24">

          {/* ── Image: first on mobile (stacks above text), right on desktop ── */}
          <div className="order-1 lg:order-2 lg:w-1/2">
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
              {/* Decorative offset shape behind the image */}
              <div
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-brand-accent/20"
                aria-hidden="true"
              />

              {/* Main image card */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=85"
                  alt="Premium Pakistani fashion collection — lawn suits and luxury formals"
                  width={600}
                  height={720}
                  className="h-[420px] w-full object-cover object-top sm:h-[500px] lg:h-[580px]"
                  priority
                />
                {/* Subtle bottom gradient for floating card legibility */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating badge: Pre-Order */}
              <div className="absolute bottom-10 left-4 rounded-2xl border border-brand-border bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm lg:-left-8">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-text-muted">Pre-Order Now</p>
                <p className="mt-0.5 text-sm font-bold text-brand-text">Eid Collection 2025</p>
                <p className="text-xs text-brand-preorder">Arrives in 10–15 days</p>
              </div>

              {/* Floating badge: Rating */}
              <div className="absolute right-4 top-10 rounded-2xl border border-brand-border bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm lg:-right-6">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-3 w-3 fill-brand-accent" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1 text-sm font-bold text-brand-text">4.9 / 5.0</p>
                <p className="text-[10px] text-brand-text-muted">500+ Reviews</p>
              </div>
            </div>
          </div>

          {/* ── Text: second on mobile (below image), left on desktop ── */}
          <div className="order-2 lg:order-1 lg:w-1/2 xl:pr-8">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent-light px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-accent" />
              New Collection 2025
            </span>

            {/* Headline */}
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.15] text-brand-text sm:text-5xl xl:text-[3.5rem]">
              Premium Pakistani<br />
              Dresses —{' '}
              <span className="text-brand-accent">Stock</span>{' '}
              &amp;{' '}
              <span className="text-brand-accent">Pre-Order</span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 max-w-lg text-base leading-relaxed text-brand-text-muted sm:text-lg">
              Shop ready stock for fast delivery, or pre-order exclusive collections imported fresh from Pakistan.
              Authentic lawn suits, luxury formals &amp; more — delivered across Bangladesh.
            </p>

            {/* CTA Buttons — full-width stacked on mobile, inline on sm+ */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-accent px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-accent-hover hover:shadow-lg"
              >
                Shop Ready Stock
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-accent px-7 py-3.5 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent-light"
              >
                Pre-Order Collection
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-7 py-3.5 text-sm font-semibold text-brand-text transition hover:border-brand-accent/40 hover:bg-brand-card"
              >
                View Catalog
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-stock/10">
                  <Package className="h-3.5 w-3.5 text-brand-stock" />
                </div>
                Ready Stock — 2–5 Days
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-preorder/10">
                  <Clock className="h-3.5 w-3.5 text-brand-preorder" />
                </div>
                Pre-Order — 10–15 Days
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />
                </div>
                100% Authentic
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
