import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          <Icon className="h-5 w-5 text-brand-accent-strong" strokeWidth={1.75} />
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
