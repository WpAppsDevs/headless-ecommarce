import { CartPageContent } from '@/components/cart/CartPageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  return { title: getDictionary(await getLocale()).cart.title };
}

export default async function CartPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.cart;
  return (
    <>
      {/* Page header */}
      <PageHeader
        title={copy.title}
        breadcrumbs={[
          { label: dictionary.common.home, href: '/' },
          { label: dictionary.shop.title, href: '/products' },
          { label: copy.title },
        ]}
      />

      {/* Cart content (client — requires cart store) */}
      <CartPageContent />
    </>
  );
}
