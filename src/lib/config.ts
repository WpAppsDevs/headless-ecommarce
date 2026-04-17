export const config = {
  apiBase: (process.env.NEXT_PUBLIC_WP_URL ?? '') + '/wp-json',
  productsNs: 'wpadhlwrapi/v1',
  apiNs: 'api',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'HeadlessECF',
  features: {
    registration: true,
    guestCheckout: true,
  },
} as const;

export type Config = typeof config;
