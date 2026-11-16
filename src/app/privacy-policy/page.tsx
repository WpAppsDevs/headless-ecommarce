import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { PrivacyPolicyContentEn } from './content/en';
import { PrivacyPolicyContentBn } from './content/bn';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.privacyPolicy;
  return { title, description };
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  return locale === 'bn' ? <PrivacyPolicyContentBn /> : <PrivacyPolicyContentEn />;
}
