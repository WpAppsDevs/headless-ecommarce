import { StaffGate } from '@/components/staff/StaffGate';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).staff.products;

  return { title: copy.title };
}

export default async function StudioProductsPage() {
  const copy = getDictionary(await getLocale()).staff.products;

  return (
    <StaffGate>
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-brand-text">{copy.title}</h1>
        <p className="text-sm text-brand-text-muted">{copy.subtitle}</p>
      </section>

      <div className="rounded-[18px] border border-brand-border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-brand-text">{copy.emptyTitle}</h2>
        <p className="mt-1 text-sm text-brand-text-muted">{copy.emptyBody}</p>
      </div>
    </StaffGate>
  );
}
