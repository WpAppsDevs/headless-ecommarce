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
        <Icon className="h-5 w-5 text-brand-accent-strong" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-brand-text">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-brand-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
