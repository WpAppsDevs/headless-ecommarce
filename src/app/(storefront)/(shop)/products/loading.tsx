export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-zinc-100" />

      <div className="flex gap-6 lg:gap-8 mt-6">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-zinc-100" style={{ width: `${70 + (i % 2) * 10}%` }} />
          ))}
        </aside>

        {/* Product grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="h-6 w-48 animate-pulse rounded bg-zinc-100" />
            <div className="hidden sm:flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-100 overflow-hidden bg-white">
                <div className="aspect-[3/4] animate-pulse bg-zinc-100" />
                <div className="p-3 sm:p-4 space-y-2.5">
                  <div className="h-4 animate-pulse rounded bg-zinc-100 w-3/4" />
                  <div className="h-3 animate-pulse rounded bg-zinc-100 w-1/2" />
                  <div className="h-5 animate-pulse rounded bg-zinc-100 w-1/3" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-8 flex-1 animate-pulse rounded bg-zinc-100" />
                    <div className="h-8 w-16 animate-pulse rounded bg-zinc-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
