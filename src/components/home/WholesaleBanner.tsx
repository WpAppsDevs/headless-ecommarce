import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { config } from '@/lib/config';
import { formatNumber } from '@/i18n/format';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function WholesaleBanner() {
  const locale = await getLocale();
  const copy = getDictionary(locale).home.wholesale;

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
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
              {copy.eyebrow}
            </span>
            <h2 id="wholesale-heading" className="mt-3 font-serif text-3xl font-bold leading-tight tracking-[-0.01em] text-white sm:text-4xl">
              {copy.titleLead}
              <br />
              <span className="text-brand-accent">{copy.titleAccent}</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 lg:max-w-lg">
              {copy.body}
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {copy.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-brand-accent/[0.08] px-3 py-1 text-xs font-medium text-brand-accent/80 ring-1 ring-brand-accent/15"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/products?tag=catalog"
                className="inline-flex items-center gap-2 rounded-full bg-brand-accent-strong px-7 py-3 text-sm font-semibold text-white ring-1 ring-brand-accent/30 transition hover:bg-brand-accent-strong-hover"
              >
                {copy.catalogCta} <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <a
                href={config.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/[0.08] px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent/15"
              >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                {copy.whatsappCta}
              </a>
            </div>
          </div>

          {/* Stats card */}
          <div className="lg:w-[400px]">
            <div className="rounded-xl border border-brand-accent/10 bg-brand-accent/[0.05] p-6">
              <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-brand-accent lg:text-left">
                {copy.networkLabel}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {copy.stats.map(({ value, suffix, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-xl bg-brand-accent/[0.07] px-4 py-5 ring-1 ring-brand-accent/10 transition-colors duration-300 hover:bg-brand-accent/[0.13] hover:ring-brand-accent/30"
                  >
                    <span className="font-serif text-2xl font-bold text-brand-gold">
                      {formatNumber(locale, value)}
                      {suffix}
                    </span>
                    <span className="mt-1 text-center text-xs leading-snug text-white/55">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-white/50">
                {copy.footnote}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
