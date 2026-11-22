'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archive, FileText, Package, Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { formatNumber } from '@/i18n/format';
import { useFormatPrice } from '@/lib/utils/currency';
import { personInitials, personName } from '@/lib/user-name';
import { listStaffProducts, type StaffProduct } from '@/lib/api/staff-products';

type Counts = { publish: number; draft: number; trash: number };

const RECENT_LIMIT = 5;

/**
 * The staff landing page: how much is where, and the next thing to do.
 *
 * Counts come from the list endpoint once per status (`per_page=1`) rather
 * than a dedicated counts route — the totals are the same query the Products
 * tab runs, so the two can never disagree.
 */
export function StudioDashboard() {
  const copy = useDictionary().staff;
  const locale = useLocale();
  const fmt = useFormatPrice();
  const { profile, user } = useAuthStore();

  const name = personName(profile, user?.display_name ?? '');
  const firstName = name.split(' ')[0] || name;
  const initials = personInitials(profile, '·');

  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<StaffProduct[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listStaffProducts({ status: 'publish', perPage: 1 }),
      listStaffProducts({ status: 'draft', perPage: 1 }),
      listStaffProducts({ status: 'trash', perPage: 1 }),
      listStaffProducts({ perPage: RECENT_LIMIT }),
    ])
      .then(([published, drafts, trash, latest]) => {
        if (cancelled) return;
        setCounts({
          publish: published.total,
          draft: drafts.total,
          trash: trash.total,
        });
        setRecent(latest.items);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const total = counts ? counts.publish + counts.draft + counts.trash : null;
  const hasProducts = total !== null && total > 0;
  const isEmpty = total === 0;

  const tiles = [
    { key: 'publish' as const, label: copy.list.statusPublished, icon: Package },
    { key: 'draft' as const, label: copy.list.statusDraft, icon: FileText },
    { key: 'trash' as const, label: copy.list.statusTrashed, icon: Archive },
  ];

  const summary =
    counts === null
      ? null
      : counts.draft > 0
        ? copy.home.summaryDrafts.replace('{count}', formatNumber(locale, counts.draft))
        : copy.home.summaryClear;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-accent-strong text-lg font-bold text-white ring-4 ring-brand-accent-light"
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight text-brand-text sm:text-2xl">
              {copy.home.greeting.replace('{name}', firstName)}
            </h2>
            <p className="mt-1 text-sm text-brand-text-muted">
              {summary ?? copy.home.loading}
            </p>
          </div>
          <Link
            href="/studio/products/new"
            className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {copy.products.newProduct}
          </Link>
        </div>
      </section>

      {failed && (
        <div className="rounded-[18px] border border-brand-border bg-white p-8 text-center">
          <p className="text-sm text-brand-text">{copy.home.loadFailed}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setFailed(false);
              setCounts(null);
              setRecent(null);
              setReloadKey((key) => key + 1);
            }}
          >
            {copy.retry}
          </Button>
        </div>
      )}

      {!failed && isEmpty && (
        <div className="rounded-[18px] border border-brand-border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-brand-text">{copy.list.emptyTitle}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-brand-text-muted">
            {copy.home.emptyBody}
          </p>
          <Link
            href="/studio/products/new"
            className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {copy.products.newProduct}
          </Link>
        </div>
      )}

      {!failed && hasProducts && counts && (
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/studio/products?status=${key}`}
              className="group rounded-2xl border border-brand-border bg-white p-4 transition-colors hover:border-brand-accent-strong"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-text-muted">
                  {label}
                </p>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-accent-light text-brand-accent-strong">
                  <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-brand-text">
                {formatNumber(locale, counts[key])}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!failed && counts === null && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-[104px] animate-pulse rounded-2xl border border-brand-border bg-white"
            />
          ))}
        </div>
      )}

      {!failed && recent !== null && recent.length > 0 && (
        <section className="rounded-[18px] border border-brand-border bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-brand-text">{copy.home.recentTitle}</h2>
            <Link
              href="/studio/products"
              className="text-sm font-medium text-brand-accent-strong hover:underline"
            >
              {copy.home.viewAll}
            </Link>
          </div>

          <ul className="mt-2 divide-y divide-brand-border">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/studio/products/${product.id}/edit`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:text-brand-accent-strong"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-brand-text">
                    {product.name}
                  </span>
                  <span className="text-xs text-brand-text-muted">
                    {product.status === 'draft'
                      ? copy.list.statusDraft
                      : product.status === 'trash'
                        ? copy.list.statusTrashed
                        : copy.list.statusPublished}
                  </span>
                  <span className="w-20 text-right text-sm tabular-nums text-brand-text">
                    {fmt(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
