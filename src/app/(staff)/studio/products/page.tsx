import Link from 'next/link';
import { Plus } from 'lucide-react';
import { StaffGate } from '@/components/staff/StaffGate';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-brand-text">{copy.title}</h1>
          <p className="text-sm text-brand-text-muted">{copy.subtitle}</p>
        </div>

        <Link href="/studio/products/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {copy.newProduct}
        </Link>
      </section>

      <div className="rounded-[18px] border border-brand-border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-brand-text">{copy.emptyTitle}</h2>
        <p className="mt-1 text-sm text-brand-text-muted">{copy.emptyBody}</p>
      </div>
    </StaffGate>
  );
}
