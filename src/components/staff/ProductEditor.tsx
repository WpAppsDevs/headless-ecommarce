'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductForm } from '@/components/staff/ProductForm';
import { useDictionary } from '@/i18n/LocaleProvider';
import { getStaffProduct, type StaffProduct } from '@/lib/api/staff-products';

/** Loads a product, then hands it to the form with its current values. */
export function ProductEditor({ productId }: { productId: number }) {
  const copy = useDictionary().staff.form;
  const [product, setProduct] = useState<StaffProduct | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getStaffProduct(productId)
      .then((next) => {
        if (!cancelled) setProduct(next);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (failed) {
    return (
      <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {copy.loadFailed}
      </p>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center gap-3 py-16 text-sm text-brand-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {copy.loading}
      </div>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
