'use client';

import { Truck } from 'lucide-react';

interface Props {
  total: number;
  threshold?: number;
}

export function FreeShippingBar({ total, threshold = 100 }: Props) {
  const progress = Math.min((total / threshold) * 100, 100);
  const remaining = Math.max(threshold - total, 0);
  const isFree = total >= threshold;

  return (
    <div className="space-y-2.5">
      <p className="text-xs leading-snug text-zinc-600">
        {isFree ? (
          <span className="font-semibold text-emerald-600">
            🎉 You&apos;ve unlocked free shipping!
          </span>
        ) : total === 0 ? (
          <>
            Spend{' '}
            <span className="font-semibold text-zinc-900">${threshold.toFixed(0)}</span>
            {' '}to get <span className="font-semibold text-zinc-900">free shipping</span>
          </>
        ) : (
          <>
            Add{' '}
            <span className="font-semibold text-zinc-900">${remaining.toFixed(2)}</span>
            {' '}more to get <span className="font-semibold text-zinc-900">free shipping</span>
          </>
        )}
      </p>

      {/* Progress track */}
      <div className="relative flex items-center">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isFree ? 'bg-emerald-500' : 'bg-zinc-900'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Truck badge at the right end */}
        <div
          className={`ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
            isFree
              ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
              : 'border-zinc-200 bg-white text-zinc-400'
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
