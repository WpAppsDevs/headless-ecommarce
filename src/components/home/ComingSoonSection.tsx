'use client';

export function ComingSoonSection() {
  return (
    <section aria-labelledby="coming-soon-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark px-8 py-14 text-center sm:px-16">
          {/* Decorative elements */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl" />

          {/* Ornament icon */}
          <div className="relative mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-accent/40 bg-brand-accent/10">
            <span className="text-3xl" role="img" aria-label="diamond ring">💎</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Coming Soon
          </p>
          <h2 id="coming-soon-heading" className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            Ornaments Collection
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
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
              className="rounded-2xl bg-brand-accent px-6 py-3.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-accent-hover sm:rounded-l-none sm:rounded-r-2xl"
            >
              Notify Me
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
