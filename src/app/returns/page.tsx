import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { localized } from '@/i18n/localized';
import { ReturnsContentEn } from './content/En';
import { ReturnsContentBn } from './content/Bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.returns;
  return { title, description };
}

export default async function ReturnsPage() {
  return localized(await getLocale(), {
    en: <ReturnsContentEn />,
    bn: <ReturnsContentBn />,
  });
}
