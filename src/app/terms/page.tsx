import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { localized } from '@/i18n/localized';
import { TermsContentEn } from './content/En';
import { TermsContentBn } from './content/Bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.terms;
  return { title, description };
}

export default async function TermsPage() {
  return localized(await getLocale(), {
    en: <TermsContentEn />,
    bn: <TermsContentBn />,
  });
}
