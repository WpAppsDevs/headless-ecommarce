import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EditorialHeadingProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Rendered as the heading's id so a section can point at it with aria-labelledby. */
  id?: string;
  /** `dark` inverts the colours for the deep panels. */
  tone?: 'light' | 'dark';
  /** Optional link on the right edge, aligned with the title baseline. */
  action?: { href: string; label: string };
  className?: string;
}

/**
 * One heading style for every content section: left-aligned, small uppercase eyebrow,
 * serif title, hairline rule. Replaces the centred pill + h2 pattern that every
 * section on the home page used to repeat.
 */
export function EditorialHeading({
  eyebrow,
  title,
  description,
  id,
  tone = 'light',
  action,
  className,
}: EditorialHeadingProps) {
  const dark = tone === 'dark';

  return (
    <div className={cn('mb-10 flex flex-wrap items-end justify-between gap-6', className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p
            className={cn(
              'mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]',
              dark ? 'text-brand-accent' : 'text-brand-accent-strong',
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={cn(
            'font-serif text-[1.75rem] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[2rem]',
            dark ? 'text-white' : 'text-brand-text',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'mt-3 text-sm leading-relaxed',
              dark ? 'text-white/60' : 'text-brand-text-muted',
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            'shrink-0 text-sm font-medium underline underline-offset-4 transition-colors',
            dark
              ? 'text-white/80 hover:text-white'
              : 'text-brand-text hover:text-brand-accent-strong',
          )}
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
