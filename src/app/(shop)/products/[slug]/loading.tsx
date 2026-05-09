export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 h-5 w-64 animate-pulse rounded bg-zinc-100" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Image gallery skeleton */}
        <div className="space-y-3">
          <div className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="h-10 w-1/3 animate-pulse rounded bg-zinc-100" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
