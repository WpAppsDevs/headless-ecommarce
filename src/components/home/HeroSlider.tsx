import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MessageCircle, Plane, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { HeroPrimaryAction } from '@/lib/product-availability';
import { config } from '@/lib/config';

interface Cta {
  href: string;
  label: string;
  Icon: LucideIcon;
  external?: boolean;
}

function CtaButton({ cta, primary }: { cta: Cta; primary: boolean }) {
  const className = primary
    ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-dark px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-md transition hover:bg-brand-dark/85 whitespace-nowrap'
    : 'inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-wine bg-brand-wine/10 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-brand-wine transition hover:bg-brand-wine/15 whitespace-nowrap';
  const Icon = cta.Icon;
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      {cta.label}
    </>
  );

  return cta.external ? (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={cta.href} className={className}>
      {content}
    </Link>
  );
}

interface HeroMode {
  headline: string;
  body: ReactNode;
  primary: Cta;
  secondary: Cta;
}

const HERO_MODES: Record<HeroPrimaryAction, HeroMode> = {
  'ready-stock': {
    headline: 'Stock & Pre-Order Available',
    body: (
      <>
        Shop the latest Pakistani collections in ready stock{' '}
        <br className="hidden sm:block" />
        or pre-order your favorite designs directly from Pakistan.
      </>
    ),
    primary: { href: '/products?tag=ready-stock', label: 'Shop Ready Stock', Icon: ShoppingBag },
    secondary: { href: '/products?tag=pre-order', label: 'Pre-Order Collection', Icon: Clock },
  },
  'pre-order': {
    headline: 'Pre-Order Available',
    body: (
      <>
        Shop the latest Pakistani collections by pre-order, delivered directly from Pakistan in
        15-25 days.
      </>
    ),
    primary: { href: '/products?tag=pre-order', label: 'Shop Pre-Order', Icon: Clock },
    secondary: { href: '/products', label: 'View All Products', Icon: ArrowRight },
  },
  contact: {
    headline: 'Contact Us for Availability',
    body: (
      <>
        Our next collection is on its way. Message us for availability and styling help.
      </>
    ),
    primary: {
      href: config.whatsappUrl,
      label: 'Contact on WhatsApp',
      Icon: MessageCircle,
      external: true,
    },
    secondary: { href: '/products', label: 'View All Products', Icon: ArrowRight },
  },
};

export function HeroSlider({ primaryAction = 'ready-stock' }: { primaryAction?: HeroPrimaryAction }) {
  const mode = HERO_MODES[primaryAction];

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[#F7EEE8] lg:min-h-[620px]">

      {/* ── Model image — absolute right half, desktop only ── */}
      <div className="absolute bottom-0 right-0 top-0 hidden w-[52%] lg:block" aria-hidden="true">
        <Image
          src="/images/hero/women-fashion.jpg"
          alt=""
          fill
          className="object-cover object-top"
          priority
          sizes="52vw"
        />
        {/* Fade from warm blush to transparent on the left edge */}
        <div className="absolute inset-y-0 left-0 w-56 bg-gradient-to-r from-[#F7EEE8] via-[#F7EEE8]/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        {/* ── Mobile image — stacks above text ── */}
        <div className="relative mt-6 h-[300px] overflow-hidden rounded-2xl lg:hidden">
          <Image
            src="/images/hero/women-fashion.jpg"
            alt="Premium Pakistani fashion collection"
            fill
            className="object-cover object-top"
            priority
            sizes="(min-width: 640px) calc(100vw - 5rem), calc(100vw - 3rem)"
          />
        </div>

        <div className="py-12 lg:py-16 xl:py-20">
          <div className="max-w-[560px] lg:max-w-[640px] xl:max-w-[720px]">

            {/* Eyebrow */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-wine">
              Premium Pakistani Fashion
            </p>

            {/* Headline */}
            <h1 className="mt-4 font-serif text-[1.6rem] font-bold leading-[1.15] text-brand-text sm:text-[2.2rem] sm:leading-[1.1] lg:text-[3rem] xl:text-[3.2rem]">
              <span className="block">Premium Pakistani Dresses</span>
              <span className="block text-[1.4rem] sm:text-[1.8rem] lg:text-[2.2rem] xl:text-[2.4rem]">
                {mode.headline}
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-4 text-[15px] leading-relaxed text-brand-text-muted">
              {mode.body}
            </p>

            {/* ── CTA Buttons — wrap naturally, full-width on mobile ── */}
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaButton cta={mode.primary} primary />
              <CtaButton cta={mode.secondary} primary={false} />
            </div>

            {/* ── Trust bar: white card with vertical dividers ── */}
            <div className="mt-8 inline-flex w-full flex-col divide-y divide-brand-border overflow-hidden rounded-xl border border-brand-border bg-white/90 shadow-md backdrop-blur-sm sm:w-auto sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Truck className="h-[18px] w-[18px] shrink-0 text-brand-wine/70" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold text-brand-text">Fast Delivery</p>
                  <p className="text-[12px] text-brand-text-muted">2-5 Days (Stock)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Plane className="h-[18px] w-[18px] shrink-0 text-brand-wine/70" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold text-brand-text">Pre-Order Delivery</p>
                  <p className="text-[12px] text-brand-text-muted">15-25 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-brand-wine/70" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold text-brand-text">100% Original</p>
                  <p className="text-[12px] text-brand-text-muted">Authentic Quality</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
