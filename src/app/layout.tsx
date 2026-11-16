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
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthHydrator } from "@/components/layout/AuthHydrator";
import { CartHydrator } from "@/components/layout/CartHydrator";
import { WishlistHydrator } from "@/components/layout/WishlistHydrator";
import { CurrencyHydrator } from "@/components/layout/CurrencyHydrator";
import { ErrorReporter } from "@/components/layout/ErrorReporter";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { config } from "@/lib/config";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { getMenuByLocation } from "@/lib/api/menus";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navLinks = await getMenuByLocation('primary');
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
          <AnnouncementBar />
          <Header navLinks={navLinks} />
          <CartDrawer />
          <Toaster richColors position="top-right" />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
