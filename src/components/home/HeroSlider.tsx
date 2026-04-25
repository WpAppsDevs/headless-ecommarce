import Link from 'next/link';

export function HeroSlider() {
  return (
    <section className="relative h-[90vh] min-h-[560px] max-h-[800px] overflow-hidden">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      {/* Deep green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7C3D52]/90 via-[#7C3D52]/65 to-[#7C3D52]/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <span className="mb-5 inline-block rounded-full border border-[#C4867A]/60 bg-[#C4867A]/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#C4867A] backdrop-blur-sm">
              Premium Pakistani Dresses
            </span>

            {/* Headline */}
            <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              Elegance from<br />
              <span className="text-[#C4867A]">Pakistan</span> to<br />
              Bangladesh
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
              Authentic lawn suits, luxury formals, and exclusive collections — delivered across Bangladesh with care.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#7C3D52] transition hover:bg-[#F7ECEA] hover:shadow-lg"
              >
                Shop Ready Stock
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#C4867A] bg-transparent px-7 py-3.5 text-sm font-semibold text-[#C4867A] backdrop-blur-sm transition hover:bg-[#C4867A]/10"
              >
                Pre-Order Collection
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                View Catalog
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Ready Stock in 2–5 Days
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C4867A]" />
                Pre-Order in 10–15 Days
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                Wholesale Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
