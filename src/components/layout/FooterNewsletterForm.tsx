'use client';

import { useState } from 'react';
import { Check, Lock } from 'lucide-react';

export function FooterNewsletterForm() {
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

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-brand-accent/10 px-5 py-4 text-sm text-brand-text">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent">
          <Check className="h-4 w-4 text-white" />
        </div>
        <span className="font-medium">You&apos;re subscribed! Thank you.</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-text-muted/60 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 bg-brand-accent px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-60"
          aria-label="Subscribe to newsletter"
        >
          {loading ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      <p className="flex items-center gap-2 text-xs text-brand-text-muted">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
}
