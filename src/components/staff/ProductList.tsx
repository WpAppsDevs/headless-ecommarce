'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ImageOff, Loader2, Pencil, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';
import { useStaffAccess } from '@/components/staff/StaffGate';
import { formatNumber } from '@/i18n/format';
import { useFormatPrice } from '@/lib/utils/currency';
import {
  listStaffProducts,
  trashStaffProduct,
  type StaffProduct,
  type StaffProductPage,
} from '@/lib/api/staff-products';

type StatusFilter = 'publish' | 'draft' | 'trash';

const PER_PAGE = 20;

/**
 * The product list: every product in the shop, filtered by state, searchable by
 * name, page by page.
 *
 * Edit and trash appear only on products this token may change; the API
 * enforces the same rule, this is just honesty about what the buttons do.
 */
export function ProductList() {
  const access = useStaffAccess();
  const canEditOthers = access?.canEditOthers ?? false;
  const copy = useDictionary().staff.list;
  const form = useDictionary().staff.form;
  const locale = useLocale();
  const fmt = useFormatPrice();

  const [status, setStatus] = useState<StatusFilter>('publish');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<StaffProductPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    listStaffProducts({ page, perPage: PER_PAGE, status, search: query })
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setFailed(false);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status, query, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const remove = async (product: StaffProduct) => {
    try {
      await trashStaffProduct(product.id);
      toast.success(copy.trashed);
      setConfirming(null);
      reload();
    } catch {
      toast.error(copy.trashFailed);
      setConfirming(null);
    }
  };

  const editable = (product: StaffProduct) => canEditOthers || product.canEdit;

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'publish', label: copy.statusPublished },
    { key: 'draft', label: copy.statusDraft },
    { key: 'trash', label: copy.statusTrashed },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-brand-border bg-white p-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => {
                setStatus(filter.key);
                setPage(1);
              }}
              aria-pressed={status === filter.key}
              className={cn(
                'rounded-full px-3 py-1 text-sm',
                status === filter.key
                  ? 'bg-brand-accent-strong text-white'
                  : 'text-brand-text-muted hover:text-brand-text',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="relative w-full sm:w-64">
          <span className="sr-only">{copy.searchLabel}</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-full border border-brand-border bg-white py-2 pl-9 pr-3 text-sm text-brand-text"
          />
        </label>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-12 text-sm text-brand-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {copy.loading}
        </div>
      )}

      {!loading && failed && (
        <div className="rounded-[18px] border border-brand-border bg-white p-8 text-center">
          <p className="text-sm text-brand-text">{copy.loadFailed}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={reload}>
            {copy.retry}
          </Button>
        </div>
      )}

      {!loading && !failed && data && data.items.length === 0 && (
        <div className="rounded-[18px] border border-brand-border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-brand-text">{copy.emptyTitle}</h2>
          <p className="mt-1 text-sm text-brand-text-muted">
            {query ? copy.noResultsBody : copy.emptyBody}
          </p>
        </div>
      )}

      {!loading && !failed && data && data.items.length > 0 && (
        <ul className="space-y-2">
          {data.items.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-3 rounded-[18px] border border-brand-border bg-white p-3 sm:flex-nowrap"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-bg">
                {product.image?.url ? (
                  <Image
                    src={product.image.url}
                    alt={product.image.alt || product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <ImageOff className="absolute inset-0 m-auto h-5 w-5 text-brand-text-muted" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-text">{product.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-brand-text-muted">
                  <span>{fmt(product.price)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {product.availability === 'pre-order'
                      ? form.preOrder
                      : product.availability === 'ready-stock'
                        ? form.readyStock
                        : copy.noAvailability}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {product.stockStatus === 'outofstock'
                      ? form.outOfStock
                      : `${form.inStock}${
                          product.manageStock && product.stockQuantity !== null
                            ? ` (${formatNumber(locale, product.stockQuantity)})`
                            : ''
                        }`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {editable(product) ? (
                  <>
                    <Link
                      href={`/studio/products/${product.id}/edit`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {copy.edit}
                    </Link>

                    {confirming === product.id ? (
                      <span className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => void remove(product)}
                        >
                          {copy.confirmTrash}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirming(null)}
                        >
                          {copy.cancel}
                        </Button>
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirming(product.id)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        {copy.trash}
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-brand-text-muted">{copy.readOnly}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !failed && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            {copy.previous}
          </Button>
          <p className="text-xs text-brand-text-muted">
            {copy.pageOf
              .replace('{page}', formatNumber(locale, page))
              .replace('{total}', formatNumber(locale, data.totalPages))}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            {copy.next}
          </Button>
        </div>
      )}
    </div>
  );
}
