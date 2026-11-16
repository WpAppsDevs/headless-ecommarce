import { Search, ShoppingBag, Package, Sparkles } from 'lucide-react';
import { EditorialHeading } from '@/components/home/EditorialHeading';
import { PRE_ORDER_WINDOW_DAYS } from '@/lib/delivery';
import { formatRange } from '@/i18n/format';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';
import { interpolate } from '@/i18n/interpolate';

const STEP_ICONS = [Search, ShoppingBag, Package, Sparkles];

export async function PreOrderSteps() {
  const locale = await getLocale();
  const copy = getDictionary(locale).home.preOrder;
  const window = formatRange(locale, PRE_ORDER_WINDOW_DAYS.min, PRE_ORDER_WINDOW_DAYS.max);

  return (
    <section aria-labelledby="preorder-heading" className="bg-brand-dark-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <EditorialHeading
          id="preorder-heading"
          tone="dark"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={interpolate(copy.description, { window })}
        />

        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.steps.map(({ title, desc }, index) => {
            const Icon = STEP_ICONS[index];
            const step = String(index + 1).padStart(2, '0');

            return (
              <div
                key={title}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.06]"
              >
                {/* Ghost step number — decorative */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-3 select-none font-mono text-5xl font-extrabold leading-none text-white/[0.07]"
                >
                  {step}
                </span>

                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/20 transition-colors duration-300 group-hover:bg-brand-accent/30">
                  <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.5} />
                </div>

                {/* Step indicator */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1 w-4 rounded-full bg-brand-accent/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-accent">
                    {interpolate(copy.stepLabel, { step })}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {interpolate(desc, { window })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
