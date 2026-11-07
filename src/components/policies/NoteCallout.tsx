import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    accent: 'text-brand-accent-strong',
    amber: 'text-amber-500',
  } as const;

  return (
    <div className={cn('flex gap-3 rounded-2xl border p-5', tones[tone], className)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconTones[tone])} strokeWidth={1.75} />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
