import { cn } from '@/lib/utils';
import type { ProductBadge } from '@/lib/product-availability';

export function AvailabilityBadge({
  badge,
  className,
}: {
  badge: ProductBadge;
  className?: string;
}) {
  if (!badge) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white',
        badge === 'pre-order' ? 'bg-brand-preorder' : 'bg-brand-text',
        className,
      )}
    >
      {badge === 'pre-order' ? 'Pre-Order' : 'Sold Out'}
    </span>
  );
}
