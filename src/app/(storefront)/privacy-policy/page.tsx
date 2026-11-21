import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { localized } from '@/i18n/localized';
import { PrivacyPolicyContentEn } from './content/En';
import { PrivacyPolicyContentBn } from './content/Bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.privacyPolicy;
  return { title, description };
}

export default async function PrivacyPolicyPage() {
  return localized(await getLocale(), {
    en: <PrivacyPolicyContentEn />,
    bn: <PrivacyPolicyContentBn />,
  });
}
