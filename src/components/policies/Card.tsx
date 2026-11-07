import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
