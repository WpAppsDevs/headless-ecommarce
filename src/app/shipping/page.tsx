import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { localized } from '@/i18n/localized';
import { ShippingContentEn } from './content/En';
import { ShippingContentBn } from './content/Bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.shipping;
  return { title, description };
}

export default async function ShippingPage() {
  return localized(await getLocale(), {
    en: <ShippingContentEn />,
    bn: <ShippingContentBn />,
  });
}
