import Link from 'next/link';
import { config } from '@/lib/config';
import { Mail, Phone } from 'lucide-react';

const SHOP_LINKS = [
  { href: '/products', label: 'All Products' },
  { href: '/products', label: 'Ready Stock' },
  { href: '/products', label: 'Pre-Order Collection' },
  { href: '/products', label: 'Lawn Suits' },
  { href: '/products', label: 'Eid Collection' },
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
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/contact', label: 'Wholesale Inquiry' },
];

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-[#C9A961] hover:text-[#C9A961]">
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F5132] text-sm font-black text-white">
                {config.siteName.charAt(0)}
              </span>
              {config.siteName}
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              Authentic Pakistani dresses for women across Bangladesh. Ready stock, pre-order, and wholesale catalog — all from trusted Pakistani manufacturers.
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
              {/* WhatsApp */}
              <SocialLink href="https://wa.me/" label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
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
                +880 1XXX-XXXXXX
              </p>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">Shop</h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-[#C9A961]">
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
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-[#C9A961]">
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
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-[#C9A961]">
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
            {['Visa', 'Mastercard', 'COD'].map((p) => (
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
