import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { ShippingContentEn } from './content/en';
import { ShippingContentBn } from './content/bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.shipping;
  return { title, description };
}

export default async function ShippingPage() {
  const locale = await getLocale();
  return locale === 'bn' ? <ShippingContentBn /> : <ShippingContentEn />;
}
