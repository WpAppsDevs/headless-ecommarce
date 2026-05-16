export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3 border-b border-zinc-100 pb-6 last:border-0">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-zinc-100" />
              <div className="h-3 w-20 rounded bg-zinc-100" />
            </div>
            <div className="h-3 w-16 rounded bg-zinc-100" />
          </div>
          <div className="h-3 w-3/4 rounded bg-zinc-100" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-zinc-100" />
            <div className="h-3 w-5/6 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
