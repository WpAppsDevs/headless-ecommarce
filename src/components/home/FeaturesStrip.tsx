import { ShieldCheck, Truck, Star, HeadphonesIcon } from 'lucide-react';
import { EditorialHeading } from '@/components/home/EditorialHeading';
import { READY_STOCK_WINDOW_DAYS } from '@/lib/delivery';
import { formatRange } from '@/i18n/format';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { interpolate } from '@/i18n/interpolate';

const FEATURE_ICONS = [ShieldCheck, Truck, Star, HeadphonesIcon];

export async function FeaturesStrip() {
  const locale = await getLocale();
  const copy = getDictionary(locale).home.features;
  const window = formatRange(locale, READY_STOCK_WINDOW_DAYS.min, READY_STOCK_WINDOW_DAYS.max);

  return (
    <section aria-labelledby="why-us-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <EditorialHeading
          id="why-us-heading"
          eyebrow={copy.eyebrow}
          title={copy.title}
        />

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {copy.items.map(({ title, desc }, index) => {
            const Icon = FEATURE_ICONS[index];

            return (
              <div
                key={title}
                className="flex flex-col items-center gap-4 rounded-xl border border-brand-border bg-brand-section p-6 text-center transition-colors duration-300 hover:border-brand-accent-strong/40 cursor-default"
              >
                {/* Icon tile */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-accent-light">
                  <Icon className="h-6 w-6 text-brand-accent-strong" strokeWidth={1.5} />
                </div>

                {/* Accent rule */}
                <div className="h-px w-8 rounded-full bg-brand-accent/40" />

                {/* Text */}
                <div>
                  <p className="text-sm font-semibold text-brand-text">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">
                    {interpolate(desc, { window })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
