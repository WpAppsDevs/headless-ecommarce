import Link from 'next/link';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current (active) page — renders as plain text */
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Full-width gradient page header with centred title and breadcrumb trail.
 * Matches the design used on the Cart page — reuse across all interior pages.
 */
export function PageHeader({ title, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-indigo-50 py-14 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{title}</h1>

      <nav aria-label="Breadcrumb" className="mt-3">
        <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-500">
          {breadcrumbs.map((item, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <li aria-hidden="true" className="select-none">
                  ›
                </li>
              )}
              <li>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="max-w-[180px] truncate font-medium text-zinc-700 sm:max-w-xs"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      {title === 'My Account' && (
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
          Manage your profile, track orders, and easily update your personal details anytime,{' '}
          all in one convenient place.
        </p>
      )}
    </div>
  );
}
