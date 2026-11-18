'use client';

import { Check } from 'lucide-react';
import { COMPACT_ORDER_STEPS, orderCompactStep } from '@/lib/order-progress';
import { useDictionary } from '@/i18n/LocaleProvider';

/** Four stages, one per real status; the stage the order is in is marked current, not done. */
export function OrderProgress({ status }: { status: string }) {
  const copy = useDictionary().account;
  const reached = orderCompactStep(status);

  if (reached === null) return null;

  return (
    <ol className="mt-5 flex">
      {COMPACT_ORDER_STEPS.map((step, index) => {
        const done = index < reached;
        const current = index === reached;
        const last = index === COMPACT_ORDER_STEPS.length - 1;

        return (
          <li
            key={step}
            aria-current={current ? 'step' : undefined}
            className={`relative flex flex-1 flex-col items-center text-center text-[10px] leading-tight ${
              done || current ? 'text-brand-text' : 'text-brand-text-muted'
            } ${current ? 'font-semibold' : ''}`}
          >
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-[9px] h-[1.5px] w-full ${
                  done ? 'bg-brand-accent-strong' : 'bg-brand-border'
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 mb-1.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border-[1.5px] ${
                done
                  ? 'border-brand-accent-strong bg-brand-accent-strong text-white'
                  : current
                    ? 'border-brand-accent-strong bg-white ring-[3px] ring-brand-accent-light'
                    : 'border-brand-border bg-white'
              }`}
            >
              {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            {copy.details.steps[step]}
          </li>
        );
      })}
    </ol>
  );
}
