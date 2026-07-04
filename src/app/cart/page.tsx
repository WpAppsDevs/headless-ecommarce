import { CartPageContent } from '@/components/cart/CartPageContent';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Shopping Cart',
};

export default function CartPage() {
  return (
    <>
      {/* Page header */}
      <PageHeader
        title="Shopping Cart"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Shop', href: '/products' },
          { label: 'Shopping Cart' },
        ]}
      />

      {/* Cart content (client — requires cart store) */}
      <CartPageContent />
    </>
  );
}
