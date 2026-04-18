'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate subscription — wire to your email service
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-zinc-900 py-20"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-zinc-700/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-zinc-600/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Stay in the loop
        </p>
        <h2
          id="newsletter-heading"
          className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
        >
          Get 10% off your first order
        </h2>
        <p className="mt-3 text-zinc-400">
          Subscribe to our newsletter for exclusive deals, style tips, and early access to new collections.
        </p>

        {submitted ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-zinc-800 px-6 py-5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">
              You&apos;re subscribed! Check your inbox for your discount code.
            </span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-2xl bg-zinc-800 px-5 py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-zinc-700 transition focus:ring-2 focus:ring-white sm:rounded-r-none sm:rounded-l-2xl"
              />
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-60 sm:rounded-l-none sm:rounded-r-2xl',
                )}
                aria-label="Subscribe to newsletter"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Subscribe
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              No spam, ever. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
