import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { getMenuByLocation } from "@/lib/api/menus";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

/**
 * The public shop: announcement bar, header, cart drawer, the single `<main>`,
 * then the footer.
 *
 * The staff dashboard lives outside this group on purpose — it needs none of
 * this chrome, and swapping it off here is cheaper and clearer than hiding it
 * per route inside the root layout.
 */
export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navLinks = await getMenuByLocation("primary");
  const locale = await getLocale();

  return (
    <>
      {/* First focusable thing in the document, so one Tab reaches it. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-accent-strong focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {getDictionary(locale).common.skipToContent}
      </a>
      <AnnouncementBar />
      <Header navLinks={navLinks} />
      <CartDrawer />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
