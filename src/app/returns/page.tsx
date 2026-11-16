import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { ReturnsContentEn } from './content/en';
import { ReturnsContentBn } from './content/bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.returns;
  return { title, description };
}

export default async function ReturnsPage() {
  const locale = await getLocale();
  return locale === 'bn' ? <ReturnsContentBn /> : <ReturnsContentEn />;
}
