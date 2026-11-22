import { StudioHeader } from '@/components/layout/StudioHeader';
import { Footer } from '@/components/layout/Footer';

/**
 * The staff surface shell.
 *
 * It keeps the shop's frame — wordmark header and the full footer — so the
 * dashboard does not read as a different website. What the header drops are
 * the storefront jobs: menu, search, cart, wishlist and account icons. The
 * footer is the shop's, unchanged.
 */
export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <StudioHeader />
      <main id="main" className="flex-1 bg-brand-bg">
        {children}
      </main>
      <Footer />
    </>
  );
}
