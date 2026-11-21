import { notFound } from 'next/navigation';
import { ProductEditor } from '@/components/staff/ProductEditor';
import { StaffGate } from '@/components/staff/StaffGate';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).staff.form;

  return { title: copy.editTitle };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) notFound();

  return (
    <StaffGate>
      <ProductEditor productId={productId} />
    </StaffGate>
  );
}
