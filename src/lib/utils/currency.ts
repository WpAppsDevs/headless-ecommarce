'use client';

import { useCurrencyStore } from '@/stores/currencyStore';

/**
 * React hook — subscribes to the currency store so components re-render when
 * the currency loads. Returns a bound `fmt(amount)` function.
 *
 * Usage:
 *   const fmt = useFormatPrice();
 *   <span>{fmt(product.price)}</span>
 */
export function useFormatPrice(): (amount: number | string) => string {
  const { symbol, position, decimals, decimalSep, thousandsSep } = useCurrencyStore();
  return formatPrice.bind(null, { symbol, position, decimals, decimalSep, thousandsSep });
}

interface FormatOptions {
  symbol: string;
  position: string;
  decimals: number;
  decimalSep: string;
  thousandsSep: string;
}

function formatPrice(opts: FormatOptions, amount: number | string): string {
  const num = Number(amount);
  if (isNaN(num)) return String(amount);

  const fixed = num.toFixed(opts.decimals);
  const [intPart, decPart] = fixed.split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandsSep);
  const formatted =
    opts.decimals > 0 ? `${intFormatted}${opts.decimalSep}${decPart}` : intFormatted;

  switch (opts.position) {
    case 'right':       return `${formatted}${opts.symbol}`;
    case 'left_space':  return `${opts.symbol} ${formatted}`;
    case 'right_space': return `${formatted} ${opts.symbol}`;
    default:            return `${opts.symbol}${formatted}`;
  }
}
