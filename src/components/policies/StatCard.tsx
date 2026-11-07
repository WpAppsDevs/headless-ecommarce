import { cn } from '@/lib/utils';

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
      <p className="mt-1 font-serif text-2xl font-bold text-brand-accent-strong">{value}</p>
      {sub && <p className="mt-1 text-xs text-brand-text-muted">{sub}</p>}
    </div>
  );
}
