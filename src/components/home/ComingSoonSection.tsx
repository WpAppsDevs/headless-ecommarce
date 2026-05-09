'use client';

import { useState } from 'react';
import { Check, Gem } from 'lucide-react';

export function ComingSoonSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok || data?.alreadySubscribed) {
        setSubmitted(true);
      } else {
        setError(data?.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="coming-soon-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark-surface">

          {/* Decorative glows */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-gold/[0.07] blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-accent/[0.07] blur-3xl" />
            {/* Top edge glow line */}
            <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative px-8 py-16 text-center sm:px-16">

            {/* Icon + badge grouped */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10 shadow-lg shadow-brand-gold/10">
                <Gem className="h-7 w-7 text-brand-gold" strokeWidth={1.5} />
              </div>
              <span className="inline-block rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                Coming Soon
              </span>
            </div>

            {/* Heading */}
            <h2 id="coming-soon-heading" className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ornaments Collection
            </h2>

            {/* Gold divider */}
            <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

            {/* Description */}
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-white/55">
              Exquisite Pakistani jewelry — chokers, earrings, bangles, and bridal sets — coming to complete your traditional look. Stay tuned for the launch.
            </p>

            {/* Notify me form */}
            {submitted ? (
              <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-2xl bg-white/[0.08] px-6 py-4 text-sm text-white ring-1 ring-white/15">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">You&apos;re on the list! We&apos;ll notify you at launch.</span>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:gap-0"
              >
                <label htmlFor="notify-email" className="sr-only">Email address</label>
                <input
                  id="notify-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email for launch notification"
                  className="flex-1 rounded-2xl bg-white/[0.08] px-5 py-3.5 text-sm text-white placeholder:text-white/35 outline-none ring-1 ring-white/15 transition focus:ring-2 focus:ring-brand-accent sm:rounded-r-none sm:rounded-l-2xl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 transition hover:bg-brand-accent-hover disabled:opacity-60 sm:rounded-l-none sm:rounded-r-2xl"
                >
                  {loading ? (
                    <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white mx-auto" />
                  ) : (
                    'Notify Me'
                  )}
                </button>
              </form>
            )}
            {error && (
              <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
