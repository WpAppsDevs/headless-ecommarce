import type { ReactNode } from 'react';

interface AccountHeadingProps {
  title: string;
  description: string;
  /** Optional meta on the right, such as a count or a filter summary. */
  children?: ReactNode;
}

/**
 * The heading of every account tab except the dashboard.
 *
 * One component rather than a copied `h2` per tab: the tabs used to disagree on
 * size, weight and whether they carried a subheading at all, and a page called
 * "My Orders" said nothing about what was on it.
 */
export function AccountHeading({ title, description, children }: AccountHeadingProps) {
  return (
    <header className="flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-left">
      <div className="min-w-0">
        <h2 className="text-[22px] font-semibold leading-tight tracking-tight text-brand-text">
          {title}
        </h2>
        <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-brand-text-muted sm:mt-1">
          {description}
        </p>
      </div>
      {children}
    </header>
  );
}
