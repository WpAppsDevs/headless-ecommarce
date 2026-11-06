import Link from 'next/link';
import { Clock, MessageCircle } from 'lucide-react';
import { config } from '@/lib/config';

export function ReadyStockEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-accent-light">
        <Clock className="h-8 w-8 text-brand-accent-strong" />
      </div>
      <h3 className="mb-2 font-serif text-xl font-bold text-brand-text">
        Ready stock is empty right now
      </h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-brand-text-muted">
        Our ready-stock pieces sell out quickly. Pre-order the latest collection, or message us
        and we&apos;ll help you find the right piece.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products?tag=pre-order"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-wine px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover"
        >
          <Clock className="h-4 w-4" />
          Shop Pre-Order
        </Link>
        <a
          href={config.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-section px-5 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-wine hover:text-brand-wine"
        >
          <MessageCircle className="h-4 w-4" />
          Message on WhatsApp
        </a>
      </div>
    </div>
  );
}
