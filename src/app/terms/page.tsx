import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { TermsContentEn } from './content/en';
import { TermsContentBn } from './content/bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.terms;
  return { title, description };
}

export default async function TermsPage() {
  const locale = await getLocale();
  return locale === 'bn' ? <TermsContentBn /> : <TermsContentEn />;
}
