import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(current: number, total: number): number[] {
  const pages: number[] = [];
  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);
  for (let i = left; i <= right; i++) pages.push(i);
  return pages;
}

export function ShopPagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="h-9 w-9 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-300 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {getPageNumbers(page, totalPages).map((p) =>
        p === page ? (
          <span
            key={p}
            className="h-9 min-w-[36px] rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-medium px-2"
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(p)}
            className="h-9 min-w-[36px] rounded-lg border border-zinc-200 flex items-center justify-center text-sm text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 px-2"
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="h-9 w-9 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-300 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
