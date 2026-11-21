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

const BASE_ACTION_ROUTE =
  'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-card py-2.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-wine hover:text-brand-wine sm:min-h-0 sm:flex-1 sm:py-2 sm:text-sm';

/**
 * The card's single action, in three states: a link to the product for a
 * variable product, an add button, or — when nothing can be bought — a link to
 * the product page instead of a button that would do nothing.
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

  if (!purchasable) {
    return (
      <Link href={`/products/${slug}`} className={cn(BASE_ACTION_ROUTE)}>
        {copy.viewProduct}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={adding}
      className={cn(BASE_CLASS, 'disabled:opacity-70', adding && 'opacity-70')}
    >
      <ShoppingBag className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
      <span className="truncate">{adding ? copy.adding : copy.addToCart}</span>
    </button>
  );
}
