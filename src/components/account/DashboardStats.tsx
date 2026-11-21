'use client';

import { CheckCheck, Package, Timer, type LucideIcon } from 'lucide-react';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { formatNumber } from '@/i18n/format';

interface DashboardStatsProps {
  activeOrders: number;
  completedOrders: number;
  totalOrders: number;
}

interface StatTile {
  id: 'active' | 'completed' | 'total';
  label: string;
  value: number;
  Icon: LucideIcon;
  /** Colour of the hairline across the tile's top edge. */
  bar: string;
  chip: string;
}

/**
 * Three counts, each with its own colour so the row reads at a glance: cobalt
 * for work in motion, green for finished, brass for the lifetime total.
 */
export function DashboardStats({ activeOrders, completedOrders, totalOrders }: DashboardStatsProps) {
  const copy = useDictionary().account;
  const locale = useLocale();

  const tiles: StatTile[] = [
    {
      id: 'active',
      label: copy.dashboard.statActive,
      value: activeOrders,
      Icon: Timer,
      bar: 'bg-brand-accent-strong',
      chip: 'bg-brand-accent-light text-brand-accent-strong',
    },
    {
      id: 'completed',
      label: copy.dashboard.statCompleted,
      value: completedOrders,
      Icon: CheckCheck,
      bar: 'bg-brand-stock',
      chip: 'bg-brand-stock/10 text-brand-stock',
    },
    {
      id: 'total',
      label: copy.dashboard.statTotal,
      value: totalOrders,
      Icon: Package,
      bar: 'bg-brand-gold',
      chip: 'bg-brand-gold/15 text-brand-gold-strong',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {tiles.map(({ id, label, value, Icon, bar, chip }) => (
        <div
          key={id}
          data-testid={`dashboard-stat-${id}`}
          className="relative overflow-hidden rounded-xl border border-brand-border bg-white px-3 pb-3.5 pt-4 sm:rounded-2xl sm:px-4"
        >
          <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden="true" />
          <div className="flex items-start justify-between gap-1.5">
            <p className="pt-0.5 text-[10px] font-medium leading-tight text-brand-text-muted sm:text-[11px]">
              {label}
            </p>
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full sm:h-8 sm:w-8 ${chip}`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.7} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold leading-none tracking-tight text-brand-text nums-lining sm:mt-2.5 sm:text-3xl">
            {formatNumber(locale, value)}
          </p>
        </div>
      ))}
    </div>
  );
}
