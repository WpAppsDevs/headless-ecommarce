'use client';

import { Gem } from 'lucide-react';

export function ComingSoonSection() {
  return (
    <section aria-labelledby="coming-soon-heading" className="bg-brand-section py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark-surface px-8 py-14 text-center sm:px-16">
          {/* Decorative glows */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-gold/[0.08] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-brand-accent/[0.08] blur-3xl" />

          {/* Icon */}
          <div className="relative mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10">
            <Gem className="h-7 w-7 text-brand-gold" strokeWidth={1.5} />
          </div>

          <span className="inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/70">
            Coming Soon
          </span>
          <h2 id="coming-soon-heading" className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">
            Ornaments Collection
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Exquisite Pakistani jewelry — chokers, earrings, bangles, and bridal sets — coming to complete your traditional look. Stay tuned for the launch.
          </p>

          {/* Notify me form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <label htmlFor="notify-email" className="sr-only">Email address</label>
            <input
              id="notify-email"
              type="email"
              placeholder="Your email for launch notification"
              className="flex-1 rounded-2xl bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-brand-accent sm:rounded-r-none sm:rounded-l-2xl"
            />
            <button
              type="submit"
              className="rounded-2xl bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-accent-hover sm:rounded-l-none sm:rounded-r-2xl"
            >
              Notify Me
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
