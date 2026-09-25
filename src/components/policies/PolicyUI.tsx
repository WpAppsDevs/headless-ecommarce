import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Section heading with a soft accent icon tile — matches the site's policy pages. */
export function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-start gap-3', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
        <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-brand-text">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-brand-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Rounded card with a subtle border. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-brand-border bg-brand-section p-6', className)}>
      {children}
    </div>
  );
}

/** Small centred stat tile (label + big value + optional unit). */
export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-brand-border bg-brand-card p-5 text-center', className)}>
      <p className="text-sm font-semibold text-brand-text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl font-bold text-brand-accent">{value}</p>
      {sub && <p className="mt-1 text-xs text-brand-text-muted">{sub}</p>}
    </div>
  );
}

/** Bullet list with a small accent dot. */
export function BulletList({
  items,
  dotClassName = 'bg-brand-accent',
  className,
}: {
  items: ReactNode[];
  dotClassName?: string;
  className?: string;
}) {
  return (
    <ul className={cn('space-y-2.5 text-sm leading-relaxed text-brand-text-muted', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', dotClassName)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Highlighted callout box. */
export function NoteCallout({
  children,
  tone = 'accent',
  icon: Icon,
  className,
}: {
  children: ReactNode;
  tone?: 'accent' | 'amber';
  icon: LucideIcon;
  className?: string;
}) {
  const tones = {
    accent: 'border-brand-accent/30 bg-brand-accent/10 text-brand-text',
    amber: 'border-amber-200 bg-amber-50 text-brand-text',
  } as const;
  const iconTones = {
    accent: 'text-brand-accent',
    amber: 'text-amber-500',
  } as const;

  return (
    <div className={cn('flex gap-3 rounded-2xl border p-5', tones[tone], className)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconTones[tone])} strokeWidth={1.75} />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/**
 * Product-type panel: a bordered card with an accent header band, used to
 * keep "স্টক পণ্য" and "প্রি-অর্ডার পণ্য" visually distinct at a glance.
 */
export function TypePanel({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-brand-border bg-brand-section', className)}>
      <div className="flex items-center gap-3 border-b border-brand-border bg-brand-accent-light/60 px-6 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-section">
          <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-brand-text">{title}</h2>
          <p className="text-xs text-brand-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
