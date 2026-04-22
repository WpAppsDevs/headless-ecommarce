'use client';

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
      <p className="text-sm leading-snug text-zinc-600">
        {isFree ? (
          <span className="font-semibold text-emerald-600">
            🎉 You&apos;ve unlocked free shipping!
          </span>
        ) : (
          <>
            Buy{' '}
            <span className="font-semibold text-rose-500">${remaining.toFixed(2)}</span>
            {' '}more to get{' '}
            <span className="font-semibold text-zinc-900">Freeship</span>
          </>
        )}
      </p>

      {/* Progress track with sliding dot indicator */}
      <div className="relative h-2 w-full rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-sm transition-all duration-700 ease-out"
          style={{ left: `${Math.max(progress, 2)}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
