import Link from 'next/link';
import { config } from '@/lib/config';
import { Mail, Phone, HelpCircle, Truck, RefreshCcw, Phone as PhoneIcon, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FooterNewsletterForm } from './FooterNewsletterForm';

const HELP_LINKS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/faq',         label: 'FAQ',                  Icon: HelpCircle  },
  { href: '/shipping',    label: 'Shipping & Delivery',  Icon: Truck       },
  { href: '/returns',     label: 'Returns & Exchanges',  Icon: RefreshCcw  },
  { href: '/contact',     label: 'Contact Us',           Icon: PhoneIcon   },
  { href: '/track-order', label: 'Track Order',          Icon: MapPin      },
];

const LEGAL_LINKS = [
  { href: '/about',          label: 'About Us'         },
  { href: '/privacy-policy', label: 'Privacy Policy'   },
  { href: '/terms',          label: 'Terms of Service' },
  { href: '/contact',        label: 'Wholesale Inquiry' },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="font-serif text-2xl font-bold text-brand-text">{children}</h3>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="h-[3px] w-8 rounded-full bg-brand-accent" />
        <div className="h-2 w-2 rounded-full bg-brand-accent" />
      </div>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent-light text-brand-text transition-all hover:bg-brand-accent hover:text-white"
    >
      {children}
    </a>
  );
}

function VisaBadge() {
  return (
    <div className="flex h-9 min-w-[54px] items-center justify-center rounded-lg bg-white px-3 shadow-sm ring-1 ring-brand-border">
      <span className="font-black italic text-[#1A1F71] text-[13px] tracking-tight">VISA</span>
    </div>
  );
}

function MastercardBadge() {
  return (
    <div className="flex h-9 min-w-[76px] items-center justify-center gap-1.5 rounded-lg bg-white px-3 shadow-sm ring-1 ring-brand-border">
      <div className="relative flex items-center">
        <div className="h-5 w-5 rounded-full bg-[#EB001B]" />
        <div className="-ml-2 h-5 w-5 rounded-full bg-[#F79E1B] opacity-90" />
      </div>
      <span className="text-[8px] font-semibold text-zinc-500">mastercard</span>
    </div>
  );
}

function AmexBadge() {
  return (
    <div className="flex h-9 min-w-[54px] items-center justify-center rounded-lg bg-[#2E77BC] px-2.5 shadow-sm">
      <div className="text-center leading-none">
        <div className="text-[7.5px] font-bold text-white">AMERICAN</div>
        <div className="text-[7.5px] font-bold text-white">EXPRESS</div>
      </div>
    </div>
  );
}

function CodBadge() {
  return (
    <div className="flex h-9 min-w-[54px] flex-col items-center justify-center rounded-lg bg-zinc-900 px-2.5 shadow-sm">
      <div className="text-[11px] font-bold leading-none text-white">COD</div>
      <div className="mt-0.5 text-[6.5px] font-medium leading-none text-zinc-400">CASH ON DELIVERY</div>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#fef5f0] to-[#fdf0f4]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

            {/* Column 1 — Brand */}
            <div className="space-y-6 lg:pr-8">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent text-lg font-black text-white shadow-sm">
                  {config.siteName.charAt(0)}
                </span>
                <span className="text-xl font-black text-brand-text">
                  Headless<span className="text-brand-accent">ECF</span>
                </span>
              </Link>

              <p className="max-w-xs text-sm leading-relaxed text-brand-text-muted">
                Authentic Pakistani dresses for women across Bangladesh. Ready stock,
                pre-order, and wholesale catalog — all from trusted Pakistani manufacturers.
              </p>

              <div className="flex gap-3">
                <SocialLink href="https://facebook.com" label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </SocialLink>
                <SocialLink href="https://instagram.com" label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </SocialLink>
                <SocialLink href="https://wa.me/" label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                </SocialLink>
                <SocialLink href="https://tiktok.com" label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
                  </svg>
                </SocialLink>
              </div>

              <div className="space-y-2.5">
                <p className="flex items-center gap-2.5 text-sm text-brand-text-muted">
                  <Mail className="h-4 w-4 shrink-0 text-brand-accent" />
                  support@headlessecf.com
                </p>
                <p className="flex items-center gap-2.5 text-sm text-brand-text-muted">
                  <Phone className="h-4 w-4 shrink-0 text-brand-accent" />
                  +880 1XXX-XXXXXX
                </p>
              </div>
            </div>

            {/* Column 2 — Help */}
            <div className="lg:border-l lg:border-brand-border lg:pl-12">
              <SectionHeading>Help</SectionHeading>
              <ul>
                {HELP_LINKS.map(({ href, label, Icon }, idx) => (
                  <li
                    key={label}
                    className={idx < HELP_LINKS.length - 1 ? 'border-b border-brand-border' : ''}
                  >
                    <Link
                      href={href}
                      className="flex items-center gap-3.5 py-3.5 text-sm font-medium text-brand-text transition-colors hover:text-brand-accent"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-brand-accent" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Newsletter */}
            <div className="lg:border-l lg:border-brand-border lg:pl-12">
              <SectionHeading>Subscribe to Newsletter</SectionHeading>
              <p className="mb-7 text-sm leading-relaxed text-brand-text-muted">
                Get updates on new collections and exclusive offers.
              </p>
              <FooterNewsletterForm />
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="bg-[#f5e4de]">
        {/* Legal links row */}
        <div className="mx-auto max-w-7xl border-b border-[#e8d0c8] px-6 py-3 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 sm:justify-start">
            {LEGAL_LINKS.map(({ href, label }, idx) => (
              <span key={label} className="flex items-center gap-5">
                <Link
                  href={href}
                  className="text-xs text-brand-text-muted transition-colors hover:text-brand-accent"
                >
                  {label}
                </Link>
                {idx < LEGAL_LINKS.length - 1 && (
                  <span className="text-brand-border">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright + payment row */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row lg:px-8">
          <p className="text-xs text-brand-text-muted">
            © {year} {config.siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <VisaBadge />
            <MastercardBadge />
            <AmexBadge />
            <CodBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}
