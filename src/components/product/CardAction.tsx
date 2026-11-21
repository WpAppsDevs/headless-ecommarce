'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/i18n/LocaleProvider';

interface CardActionProps {
  slug: string;
  isVariable: boolean;
  purchasable: boolean;
  adding: boolean;
  onAdd: () => void;
}

const BASE_CLASS =
  'flex w-full items-center justify-center gap-2 rounded-lg bg-brand-wine py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover sm:flex-1 sm:gap-1.5 sm:py-2 sm:text-sm sm:px-3';

/**
 * The card's single action: a link for a variable product, a button otherwise —
 * and a disabled "Sold Out" once the product cannot be bought.
 *
 * A sold-out card used to keep an enabled button whose handler returned early,
 * so the click did nothing at all: no message, no cart change.
 */
export function CardAction({ slug, isVariable, purchasable, adding, onAdd }: CardActionProps) {
  const copy = useDictionary().product;

  if (isVariable) {
    return (
      <Link href={`/products/${slug}`} className={BASE_CLASS}>
        <ShoppingBag className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
        <span>{copy.selectOptions}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={adding || !purchasable}
      className={cn(
        BASE_CLASS,
        'disabled:opacity-70',
        !purchasable && 'bg-brand-border text-brand-text-muted',
        adding && 'opacity-70',
      )}
    >
      <ShoppingBag className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
      <span className="truncate">
        {!purchasable ? copy.badge.soldOut : adding ? copy.adding : copy.addToCart}
      </span>
    </button>
  );
}
