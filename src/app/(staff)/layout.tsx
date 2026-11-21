/**
 * The staff surface shell. Deliberately chrome-free: no announcement bar, no
 * cart, no wishlist and no shop footer, because none of it belongs to the person
 * uploading products.
 *
 * The dashboard's own navigation and guard are added with the first `/studio`
 * route; this file exists so the group owns its `<main>` from the start.
 */
export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main id="main" className="flex-1 bg-brand-bg">
      {children}
    </main>
  );
}
