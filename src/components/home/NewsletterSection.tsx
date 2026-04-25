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
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-[#0F5132] py-20"
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C9A961]/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A961]">
          Stay in the Loop
        </p>
        <h2
          id="newsletter-heading"
          className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl"
        >
          Get 10% Off Your First Order
        </h2>
        <p className="mt-3 text-white/70">
          Subscribe for exclusive previews, new collection alerts, and special offers for our Bangladesh community.
        </p>

        {submitted ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-[#0a3d26] px-6 py-5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">
              You&apos;re subscribed! Your discount code is on its way.
            </span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-2xl bg-[#0a3d26] px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-[#C9A961] sm:rounded-r-none sm:rounded-l-2xl"
              />
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl bg-[#C9A961] px-7 py-3.5 text-sm font-semibold text-[#0F5132] transition hover:bg-[#b8923f] disabled:opacity-60 sm:rounded-l-none sm:rounded-r-2xl',
                )}
                aria-label="Subscribe to newsletter"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F5132]/40 border-t-[#0F5132]" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Subscribe
              </button>
            </div>
            <p className="mt-3 text-xs text-white/40">No spam, ever. Unsubscribe at any time.</p>
          </form>
        )}
      </div>
    </section>
  );
}
