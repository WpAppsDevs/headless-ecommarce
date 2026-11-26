'use client';

import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/staff/RichTextEditor';
import { STAFF_FIELD_CLASS, STAFF_SECTION_CLASS } from '@/components/staff/styles';
import { useDictionary } from '@/i18n/LocaleProvider';
import { skuFromName, type StaffProductFormValues } from '@/lib/staff-product-schema';

interface ProductDetailsFieldsProps {
  form: UseFormReturn<StaffProductFormValues>;
}

/** Name, description, SKU, the two prices and stock — the top half of the form. */
export function ProductDetailsFields({ form }: ProductDetailsFieldsProps) {
  const copy = useDictionary().staff.form;
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const stockMode = watch('stockMode');
  const name = watch('name');
  const description = watch('description');
  const regularPrice = watch('regularPrice');
  const sellPrice = watch('sellPrice');

  // The SKU follows the product name until the staff member types their own:
  // from then on it is theirs, and an existing SKU on the edit form is never
  // overwritten.
  const [skuEdited, setSkuEdited] = useState(false);

  useEffect(() => {
    if (skuEdited) return;

    const suggestion = skuFromName(name);

    if (suggestion !== '') setValue('sku', suggestion, { shouldDirty: true });
  }, [name, skuEdited, setValue]);

  const showDiscount =
    Number(sellPrice) > 0 &&
    Number(regularPrice) > 0 &&
    Number(sellPrice) < Number(regularPrice);

  return (
    <>
      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.basics}</h2>

        <div className="space-y-2">
          <Label htmlFor="product-name">{copy.nameLabel}</Label>
          <input
            id="product-name"
            className={STAFF_FIELD_CLASS}
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && (
            <p role="alert" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">{copy.descriptionLabel}</Label>
          <p className="text-xs text-brand-text-muted">{copy.descriptionHint}</p>
          <RichTextEditor
            id="product-description"
            value={description}
            onChange={(html) => setValue('description', html, { shouldDirty: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-sku">{copy.skuLabel}</Label>
          <input
            id="product-sku"
            className={STAFF_FIELD_CLASS}
            {...register('sku', {
              onChange: () => setSkuEdited(true),
            })}
          />
          <p className="text-xs text-brand-text-muted">{copy.skuHint}</p>
        </div>
      </section>

      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.pricing}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-regular-price">
              {copy.regularPriceLabel}{' '}
              <span className="font-normal text-brand-text-muted">({copy.markRequired})</span>
            </Label>
            <input
              id="product-regular-price"
              inputMode="decimal"
              className={STAFF_FIELD_CLASS}
              aria-invalid={Boolean(errors.regularPrice)}
              {...register('regularPrice')}
            />
            {errors.regularPrice && (
              <p role="alert" className="text-sm text-destructive">
                {errors.regularPrice.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sell-price">
              {copy.sellPriceLabel}{' '}
              <span className="font-normal text-brand-text-muted">({copy.markOptional})</span>
            </Label>
            <input
              id="product-sell-price"
              inputMode="decimal"
              className={STAFF_FIELD_CLASS}
              aria-invalid={Boolean(errors.sellPrice)}
              {...register('sellPrice')}
            />
            {errors.sellPrice && (
              <p role="alert" className="text-sm text-destructive">
                {errors.sellPrice.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-brand-text-muted">
          {showDiscount ? copy.discountHint : copy.noDiscountHint}
        </p>

        <div className="space-y-2">
          <Label htmlFor="product-resell-price">
            {copy.resellPriceLabel}{' '}
            <span className="font-normal text-brand-text-muted">({copy.markRequired})</span>
          </Label>
          <input
            id="product-resell-price"
            inputMode="decimal"
            className={STAFF_FIELD_CLASS}
            aria-invalid={Boolean(errors.resellPrice)}
            {...register('resellPrice')}
          />
          {errors.resellPrice && (
            <p role="alert" className="text-sm text-destructive">
              {errors.resellPrice.message}
            </p>
          )}
          <p className="text-xs text-brand-text-muted">{copy.resellHint}</p>
        </div>
      </section>

      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.stock}</h2>

        <fieldset className="flex flex-wrap gap-4">
          <legend className="sr-only">{copy.stockModeLabel}</legend>
          <label className="flex items-center gap-2 text-sm text-brand-text">
            <input type="radio" value="managed" className="h-4 w-4" {...register('stockMode')} />
            {copy.stockModeManaged}
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-text">
            <input type="radio" value="status" className="h-4 w-4" {...register('stockMode')} />
            {copy.stockModeStatus}
          </label>
        </fieldset>

        {stockMode === 'managed' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-quantity">{copy.quantityLabel}</Label>
              <input
                id="product-quantity"
                inputMode="numeric"
                className={STAFF_FIELD_CLASS}
                aria-invalid={Boolean(errors.stockQuantity)}
                {...register('stockQuantity')}
              />
              {errors.stockQuantity && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-backorders">{copy.backordersLabel}</Label>
              <select id="product-backorders" className={STAFF_FIELD_CLASS} {...register('backorders')}>
                <option value="no">{copy.backordersNo}</option>
                <option value="notify">{copy.backordersNotify}</option>
                <option value="yes">{copy.backordersYes}</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="product-stock-status">{copy.stockStatusLabel}</Label>
            <select
              id="product-stock-status"
              className={STAFF_FIELD_CLASS}
              {...register('stockStatus')}
            >
              <option value="instock">{copy.inStock}</option>
              <option value="outofstock">{copy.outOfStock}</option>
            </select>
          </div>
        )}
      </section>
    </>
  );
}
