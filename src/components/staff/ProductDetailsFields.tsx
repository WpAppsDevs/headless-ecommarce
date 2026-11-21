'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/staff/RichTextEditor';
import { STAFF_FIELD_CLASS, STAFF_SECTION_CLASS } from '@/components/staff/styles';
import { useDictionary } from '@/i18n/LocaleProvider';
import type { StaffProductFormValues } from '@/lib/staff-product-schema';

interface ProductDetailsFieldsProps {
  form: UseFormReturn<StaffProductFormValues>;
}

/** Name, description, SKU, the two prices and stock — the top half of the form. */
export function ProductDetailsFields({ form }: ProductDetailsFieldsProps) {
  const copy = useDictionary().staff.form;
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const stockMode = watch('stockMode');
  const description = watch('description');
  const regularPrice = watch('regularPrice');
  const sellPrice = watch('sellPrice');

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
          <input id="product-sku" className={STAFF_FIELD_CLASS} {...register('sku')} />
          <p className="text-xs text-brand-text-muted">{copy.skuHint}</p>
        </div>
      </section>

      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.pricing}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-regular-price">{copy.regularPriceLabel}</Label>
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
            <Label htmlFor="product-sell-price">{copy.sellPriceLabel}</Label>
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
