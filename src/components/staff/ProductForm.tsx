'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDictionary } from '@/i18n/LocaleProvider';
import { STAFF_FIELD_CLASS, STAFF_SECTION_CLASS } from '@/components/staff/styles';
import { MediaUploader } from '@/components/staff/MediaUploader';
import { ProductDetailsFields } from '@/components/staff/ProductDetailsFields';
import { ProductOrganisationFields } from '@/components/staff/ProductOrganisationFields';
import {
  createStaffProduct,
  getStaffOptions,
  updateStaffProduct,
  type StaffImage,
  type StaffOptions,
  type StaffProduct,
} from '@/lib/api/staff-products';
import { ApiError } from '@/lib/errors';
import {
  buildStaffProductSchema,
  toStaffProductPayload,
  type StaffProductFormValues,
} from '@/lib/staff-product-schema';

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: StaffProduct;
}

function defaultsFrom(product?: StaffProduct): StaffProductFormValues {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    regularPrice: product?.regularPrice ?? '',
    // Empty means "no discount" — never copy the regular price in, or saving
    // would look like a sale that is exactly 0% off.
    sellPrice: product?.salePrice ?? '',
    resellPrice: product?.resellPrice ?? '',
    sku: product?.sku ?? '',
    stockMode: product?.manageStock === false ? 'status' : 'managed',
    stockQuantity: String(product?.stockQuantity ?? 0),
    backorders: product?.backorders === 'notify' || product?.backorders === 'yes' ? product.backorders : 'no',
    stockStatus: product?.stockStatus === 'outofstock' ? 'outofstock' : 'instock',
    categoryIds: product?.categories.map((term) => term.id) ?? [],
    brandIds: product?.brands.map((term) => term.id) ?? [],
    availability: product?.availability === 'pre-order' ? 'pre-order' : 'ready-stock',
    imageId: product?.image?.id ?? 0,
    galleryIds: product?.gallery.map((image) => image.id) ?? [],
    status: product?.status === 'publish' ? 'publish' : 'draft',
  };
}

/**
 * Create or edit one simple product.
 *
 * Images are uploaded first and referenced by id, so a bad file is reported
 * before anything is saved. Create sends an Idempotency-Key: a double submit or
 * a retried request replays the first product instead of making a second one.
 */
export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const copy = useDictionary().staff.form;
  const [options, setOptions] = useState<StaffOptions | null>(null);
  const [optionsFailed, setOptionsFailed] = useState(false);
  const [featured, setFeatured] = useState<StaffImage[]>(product?.image ? [product.image] : []);
  const [gallery, setGallery] = useState<StaffImage[]>(product?.gallery ?? []);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Stable for this form instance and unique per mount: a double submit or a
  // retried request replays the first product instead of creating a second.
  const formId = useId();
  const idempotencyKey = `staff-${formId}`;

  const schema = useMemo(() => buildStaffProductSchema(copy.errors), [copy.errors]);
  const form = useForm<StaffProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultsFrom(product),
  });

  useEffect(() => {
    let cancelled = false;

    getStaffOptions()
      .then((next) => {
        if (!cancelled) setOptions(next);
      })
      .catch(() => {
        if (!cancelled) setOptionsFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (values: StaffProductFormValues) => {
    setSubmitError(null);

    try {
      const payload = toStaffProductPayload(values);

      if (mode === 'create') {
        await createStaffProduct(payload, idempotencyKey);
        toast.success(copy.created);
      } else if (product) {
        await updateStaffProduct(product.id, payload);
        toast.success(copy.updated);
      }

      router.push('/studio/products');
      router.refresh();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : '';
      const known: Record<string, string> = {
        invalid_sell_price: copy.errors.sellAboveRegular,
        invalid_category: copy.errors.categoryRequired,
        invalid_image: copy.errors.imageRequired,
        invalid_gallery: copy.errors.galleryLimit,
        duplicate_sku: copy.errors.duplicateSku,
        not_product_owner: copy.errors.notOwner,
      };

      setSubmitError(known[code] ?? (error instanceof Error ? error.message : copy.failed));
    }
  };

  const { formState } = form;

  return (
    <form
      method="post"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 pb-16"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-text">
          {mode === 'create' ? copy.newTitle : copy.editTitle}
        </h1>
        <p className="text-sm text-brand-text-muted">
          {mode === 'create' ? copy.newSubtitle : copy.editSubtitle}
        </p>
      </header>

      {optionsFailed && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {copy.optionsFailed}
        </p>
      )}

      <ProductDetailsFields form={form} />

      {options && <ProductOrganisationFields form={form} options={options} />}

      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.images}</h2>

        <MediaUploader
          label={copy.featuredLabel}
          hint={copy.featuredHint}
          images={featured}
          max={1}
          maxFileMb={options?.limits.maxFileMb ?? 5}
          onChange={(next) => {
            setFeatured(next);
            form.setValue('imageId', next[0]?.id ?? 0, { shouldValidate: true });
          }}
        />
        {formState.errors.imageId && (
          <p role="alert" className="text-sm text-destructive">
            {formState.errors.imageId.message}
          </p>
        )}

        <MediaUploader
          label={copy.galleryLabel}
          hint={copy.galleryHint}
          images={gallery}
          max={options?.limits.gallery ?? 6}
          maxFileMb={options?.limits.maxFileMb ?? 5}
          onChange={(next) => {
            setGallery(next);
            form.setValue(
              'galleryIds',
              next.map((image) => image.id),
              { shouldValidate: true },
            );
          }}
        />
      </section>

      <section className={STAFF_SECTION_CLASS}>
        <div className="space-y-2">
          <Label htmlFor="product-status">{copy.statusLabel}</Label>
          <select id="product-status" className={STAFF_FIELD_CLASS} {...form.register('status')}>
            <option value="draft">{copy.statusDraft}</option>
            <option value="publish">{copy.statusPublish}</option>
          </select>
          <p className="text-xs text-brand-text-muted">{copy.statusHint}</p>
        </div>
      </section>

      {submitError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={formState.isSubmitting || !options}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {copy.submitting}
            </>
          ) : mode === 'create' ? (
            copy.submitCreate
          ) : (
            copy.submitUpdate
          )}
        </Button>
        <Link href="/studio/products" className="text-sm text-brand-text-muted hover:underline">
          {copy.cancel}
        </Link>
      </div>
    </form>
  );
}
