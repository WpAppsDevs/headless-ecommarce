import { StaffGate } from '@/components/staff/StaffGate';
import { StudioDashboard } from '@/components/staff/StudioDashboard';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).staff;

  return { title: copy.identityLabel };
}

/**
 * The staff landing page. Products live one route down; this page answers
 * "where is everything" and offers the next action, the way the account
 * dashboard does for orders.
 */
export default function StudioIndexPage() {
  return (
    <StaffGate>
      <StudioDashboard />
    </StaffGate>
  );
}
