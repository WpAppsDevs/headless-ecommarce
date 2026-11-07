import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Bullet list with a small accent dot. */
export function BulletList({
  items,
  dotClassName = 'bg-brand-accent-strong',
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
