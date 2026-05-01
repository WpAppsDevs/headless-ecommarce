import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Active Resellers' },
  { value: '50+', label: 'Catalog Designs' },
  { value: '7', label: 'Divisions Covered' },
  { value: '৳500+', label: 'Min. Order Value' },
];

const FEATURES = ['Stock: Cash on Delivery', 'Pre-Order: 70% Advance', 'MOQ: As Per Catalog'];

export function WholesaleBanner() {
  return (
    <section aria-labelledby="wholesale-heading" className="relative overflow-hidden bg-brand-dark-surface py-20">
      {/* Warm radial glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-64 -top-64 h-[32rem] w-[32rem] rounded-full bg-brand-accent/[0.07] blur-3xl" />
        <div className="absolute -bottom-64 -left-64 h-[32rem] w-[32rem] rounded-full bg-brand-wine/[0.06] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">

          {/* Text block */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
              Wholesale & Catalog
            </span>
            <h2 id="wholesale-heading" className="mt-5 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
              Grow Your Business with
              <br />
              <span className="text-brand-accent">Our Catalog Collections</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 lg:max-w-lg">
              Are you a boutique owner or reseller? Access our full catalog of Pakistani dresses at wholesale prices. Fast turnaround, reliable quality, and dedicated account support.
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {FEATURES.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-brand-accent/[0.08] px-3 py-1 text-xs font-medium text-brand-accent/80 ring-1 ring-brand-accent/15"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/products?tag=catalog"
                className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-7 py-3 text-sm font-semibold text-brand-dark transition hover:bg-brand-accent-hover"
              >
                View Catalog <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/[0.08] px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent/15"
              >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                Contact on WhatsApp
              </a>
            </div>
          </div>

          {/* Stats card */}
          <div className="lg:w-[400px]">
            <div className="rounded-2xl border border-brand-accent/10 bg-brand-accent/[0.05] p-6">
              <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-brand-accent/60 lg:text-left">
                Our Wholesale Network
              </p>
              <div className="grid grid-cols-2 gap-3">
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-xl bg-brand-accent/[0.07] px-4 py-5 ring-1 ring-brand-accent/10"
                  >
                    <span className="font-serif text-2xl font-bold text-brand-gold">{value}</span>
                    <span className="mt-1 text-center text-xs leading-snug text-white/55">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-white/50">
                Trusted by boutique owners across Bangladesh
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
