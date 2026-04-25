import Link from 'next/link';

const STATS = [
  { value: '500+', label: 'Active Resellers' },
  { value: '50+', label: 'Catalog Designs' },
  { value: '7', label: 'Divisions Covered' },
  { value: '৳500+', label: 'Min. Order Value' },
];

export function WholesaleBanner() {
  return (
    <section aria-labelledby="wholesale-heading" className="relative overflow-hidden bg-[#0a3d26] py-16">
      {/* Decorative pattern */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#C9A961]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#C9A961]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:text-left">
          {/* Text block */}
          <div className="flex-1">
            <span className="inline-block rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#C9A961]">
              Wholesale & Catalog
            </span>
            <h2 id="wholesale-heading" className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">
              Grow Your Business with<br />
              <span className="text-[#C9A961]">Our Catalog Collections</span>
            </h2>
            <p className="mt-4 max-w-xl text-white/70">
              Are you a boutique owner or reseller? Access our full catalog of Pakistani dresses at wholesale prices. Fast turnaround, reliable quality, and dedicated account support.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#C9A961] px-7 py-3.5 text-sm font-semibold text-[#0F5132] transition hover:bg-[#b8923f]"
              >
                View Catalog
              </Link>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid w-full grid-cols-2 gap-4 sm:max-w-xs lg:max-w-none lg:grid-cols-4 lg:w-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center rounded-2xl bg-white/5 px-5 py-5 ring-1 ring-white/10">
                <span className="font-serif text-2xl font-bold text-[#C9A961]">{value}</span>
                <span className="mt-1 text-center text-xs text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
