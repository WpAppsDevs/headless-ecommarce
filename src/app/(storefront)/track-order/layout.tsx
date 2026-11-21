import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

/**
 * `/track-order` is a client page and cannot export `metadata` itself, so the
 * localized title and description live here.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = getDictionary(await getLocale()).pages.trackOrder;
  return { title, description };
}

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
