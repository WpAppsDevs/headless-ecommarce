const WP_URL = process.env.NEXT_PUBLIC_WP_URL;

if (!WP_URL && typeof window === 'undefined') {
  // During build/SSR — warn clearly instead of producing a broken relative URL
  console.warn(
    '[config] NEXT_PUBLIC_WP_URL is not set. ' +
    'Add it to your .env.local (local) or Vercel Environment Variables (production).',
  );
}

export const config = {
  apiBase: (WP_URL ?? '') + '/wp-json',
  productsNs: 'wpadhlwrapi/v1',
  apiNs: 'api',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'HeadlessECF',
  hero: {
    title: process.env.NEXT_PUBLIC_HERO_TITLE ?? 'Shop the Latest Collection',
    subtitle:
      process.env.NEXT_PUBLIC_HERO_SUBTITLE ??
      'Discover premium products, delivered fast.',
    ctaText: process.env.NEXT_PUBLIC_HERO_CTA_TEXT ?? 'Shop All Products',
    ctaLink: process.env.NEXT_PUBLIC_HERO_CTA_LINK ?? '/products',
  },
  features: {
    registration: true,
    guestCheckout: true,
  },
} as const;

export type Config = typeof config;
