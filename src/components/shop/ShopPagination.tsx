import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 36px visual control with a 44px hit area from the pseudo-element. Keeping the
// visual size prevents the pagination row from wrapping at 375px.
const PAGINATION_CONTROL_CLASS =
  'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150 focus-brand after:absolute after:-inset-[5px] after:content-[""]';
const PAGINATION_PAGE_CLASS =
  'relative inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition-all duration-150 focus-brand after:absolute after:-inset-[5px] after:content-[""]';
const DISABLED_CLASS =
  'inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-brand-border bg-brand-card text-brand-border';

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
      className="mt-10 flex items-center justify-center gap-2.5"
    >
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          className={`${PAGINATION_CONTROL_CLASS} border-brand-border text-brand-text-muted hover:border-brand-accent-strong hover:bg-brand-card`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <button type="button" disabled className={DISABLED_CLASS} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {getPageNumbers(page, totalPages).map((p) =>
        p === page ? (
          <span
            key={p}
            className={`${PAGINATION_PAGE_CLASS} border-brand-wine bg-brand-wine font-medium text-white`}
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(p)}
            className={`${PAGINATION_PAGE_CLASS} border-brand-border text-brand-text-muted hover:border-brand-accent-strong hover:bg-brand-card`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          className={`${PAGINATION_CONTROL_CLASS} border-brand-border text-brand-text-muted hover:border-brand-accent-strong hover:bg-brand-card`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button type="button" disabled className={DISABLED_CLASS} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}
