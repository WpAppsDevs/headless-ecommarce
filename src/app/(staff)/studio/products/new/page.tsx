import { ProductForm } from '@/components/staff/ProductForm';
import { StaffGate } from '@/components/staff/StaffGate';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).staff.form;

  return { title: copy.newTitle };
}

export default function NewProductPage() {
  return (
    <StaffGate>
      <ProductForm mode="create" />
    </StaffGate>
  );
}
