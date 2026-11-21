import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Inter,
  Noto_Sans_Bengali,
  Noto_Serif_Bengali,
} from "next/font/google";
import "./globals.css";
import { AuthHydrator } from "@/components/layout/AuthHydrator";
import { CartHydrator } from "@/components/layout/CartHydrator";
import { WishlistHydrator } from "@/components/layout/WishlistHydrator";
import { CurrencyHydrator } from "@/components/layout/CurrencyHydrator";
import { ErrorReporter } from "@/components/layout/ErrorReporter";
import { Toaster } from "sonner";
import { config } from "@/lib/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Bengali glyphs only. It sits behind Inter in the font stacks, so Latin text
 * keeps Inter and Bangla text falls here — and because the file carries only
 * the `bengali` unicode range, an English page never downloads it.
 */
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  display: "swap",
});

/**
 * The Bangla counterpart of Playfair: `font-serif` headings need a serif face
 * that actually has Bengali glyphs, or they fall back to the sans one and stop
 * matching the Latin headings beside them.
 */
const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-serif-bengali",
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  title: config.siteName,
  description: "Headless eCommerce powered by WooCommerce",
};

/**
 * Document shell only: html/body, fonts, the locale provider, the hydrators and
 * the toast outlet. Storefront chrome (announcement bar, header, cart drawer,
 * footer) lives in `(storefront)/layout.tsx`, and the staff dashboard brings its
 * own shell in `(staff)/layout.tsx`.
 *
 * Splitting here keeps one root layout, so no route needs a second `<html>`,
 * and a surface can be chrome-free without a pathname check.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} ${notoBengali.variable} ${notoSerifBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LocaleProvider locale={locale} dictionary={getDictionary(locale)}>
          <AuthHydrator />
          <CartHydrator />
          <WishlistHydrator />
          <CurrencyHydrator />
          <ErrorReporter />
          <Toaster richColors position="top-right" />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
