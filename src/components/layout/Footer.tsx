import Link from 'next/link';
import { config } from '@/lib/config';
import { Mail, Phone, MapPin } from 'lucide-react';

const SHOP_LINKS = [
  { href: '/products', label: 'All Products' },
  { href: '/products?category=new-arrivals', label: 'New Arrivals' },
  { href: '/products?on_sale=true', label: 'Sale' },
  { href: '/products?category=best-sellers', label: 'Best Sellers' },
];

const HELP_LINKS = [
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping', label: 'Shipping & Delivery' },
  { href: '/returns', label: 'Returns & Exchanges' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/track-order', label: 'Track Order' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/careers', label: 'Careers' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
];

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-white hover:text-white">
      {children}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-300">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-zinc-900">
                {config.siteName.charAt(0)}
              </span>
              {config.siteName}
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              Premium fashion for every move. Designed for those who demand performance without sacrificing style.
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <SocialLink href="https://facebook.com" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </SocialLink>
              {/* Instagram */}
              <SocialLink href="https://instagram.com" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </SocialLink>
              {/* X/Twitter */}
              <SocialLink href="https://x.com" label="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
              {/* TikTok */}
              <SocialLink href="https://tiktok.com" label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
                </svg>
              </SocialLink>
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                support@{config.siteName.toLowerCase()}.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                +1 (555) 000-0000
              </p>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Shop</h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Help</h3>
            <ul className="space-y-3">
              {HELP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-zinc-500">
            © {year} {config.siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            {/* Payment icons */}
            {['Visa', 'MC', 'Amex', 'PayPal', 'Stripe'].map((p) => (
              <span key={p} className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

