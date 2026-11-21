'use client';

import { Check } from 'lucide-react';
import { COMPACT_ORDER_STEPS, orderCompactStep } from '@/lib/order-progress';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { formatNumber } from '@/i18n/format';

/**
 * Four stages, one per real status, on a quiet strip inside the order row.
 *
 * The stage the order is in is filled and marked current, the stages behind it
 * carry a check, and the ones ahead stay numbered: a customer scanning the
 * list sees how far the parcel has travelled without opening the order.
 */
export function OrderProgress({ status }: { status: string }) {
  const copy = useDictionary().account;
  const locale = useLocale();
  const reached = orderCompactStep(status);

  if (reached === null) return null;

  return (
    <div className="mt-3.5 rounded-xl bg-brand-bg px-3 py-2.5">
      <ol className="grid grid-cols-4">
        {COMPACT_ORDER_STEPS.map((step, index) => {
          const done = index < reached;
          const current = index === reached;

          return (
            <li
              key={step}
              aria-current={current ? 'step' : undefined}
              className="relative flex flex-col items-center text-center"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-[9px] h-px w-full ${
                    index <= reached ? 'bg-brand-accent-strong/40' : 'bg-brand-border'
                  }`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold ${
                  current
                    ? 'bg-brand-accent-strong text-white'
                    : done
                      ? 'bg-brand-accent-light text-brand-accent-strong'
                      : 'bg-white text-brand-text-muted ring-1 ring-brand-border'
                }`}
              >
                {done ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : (
                  formatNumber(locale, index + 1)
                )}
              </span>
              <span
                className={`mt-1.5 block text-[11px] leading-tight ${
                  current ? 'font-bold text-brand-text' : 'text-brand-text-muted'
                }`}
              >
                {copy.details.steps[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
