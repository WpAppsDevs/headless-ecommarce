'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { STAFF_FIELD_CLASS, STAFF_SECTION_CLASS } from '@/components/staff/styles';
import { useDictionary } from '@/i18n/LocaleProvider';
import type { StaffOptions, StaffTerm } from '@/lib/api/staff-products';
import type { StaffProductFormValues } from '@/lib/staff-product-schema';

interface ProductOrganisationFieldsProps {
  form: UseFormReturn<StaffProductFormValues>;
  options: StaffOptions;
}

/**
 * Availability, categories and brand.
 *
 * Availability is the first choice because the storefront behaves differently
 * for each: a Ready Stock product leaves the collection when it sells out, while
 * a Pre-Order stays buyable. It is a choice, not a tag the staff member picks
 * from a list.
 */
export function ProductOrganisationFields({ form, options }: ProductOrganisationFieldsProps) {
  const copy = useDictionary().staff.form;
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const availability = watch('availability');
  const categoryIds = watch('categoryIds');
  const brandIds = watch('brandIds');

  const toggle = (list: number[], id: number): number[] =>
    list.includes(id) ? list.filter((value) => value !== id) : [...list, id];

  const choices: { key: 'ready-stock' | 'pre-order'; title: string; hint: string }[] = [
    { key: 'ready-stock', title: copy.readyStock, hint: copy.readyStockHint },
    { key: 'pre-order', title: copy.preOrder, hint: copy.preOrderHint },
  ];

  return (
    <>
      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.availability}</h2>
        <p className="text-xs text-brand-text-muted">{copy.availabilityHint}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {choices.map((choice) => (
            <label
              key={choice.key}
              className={cn(
                'cursor-pointer rounded-lg border p-3 text-sm',
                availability === choice.key
                  ? 'border-brand-accent-strong bg-brand-accent-light'
                  : 'border-brand-border bg-white',
              )}
            >
              <span className="flex items-center gap-2 font-medium text-brand-text">
                <input
                  type="radio"
                  value={choice.key}
                  className="h-4 w-4"
                  {...register('availability')}
                />
                {choice.title}
              </span>
              <span className="mt-1 block text-xs text-brand-text-muted">{choice.hint}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={STAFF_SECTION_CLASS}>
        <h2 className="text-base font-semibold text-brand-text">{copy.organisation}</h2>

        <div className="space-y-2">
          <Label>{copy.categoryLabel}</Label>
          {options.categories.length === 0 ? (
            <p className="text-sm text-brand-text-muted">{copy.noCategories}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {options.categories.map((term: StaffTerm) => (
                <label
                  key={term.id}
                  className={cn(
                    'cursor-pointer rounded-full border px-3 py-1 text-sm',
                    categoryIds.includes(term.id)
                      ? 'border-brand-accent-strong bg-brand-accent-light text-brand-accent-strong'
                      : 'border-brand-border bg-white text-brand-text',
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={categoryIds.includes(term.id)}
                    onChange={() =>
                      setValue('categoryIds', toggle(categoryIds, term.id), {
                        shouldValidate: true,
                      })
                    }
                  />
                  {term.name}
                </label>
              ))}
            </div>
          )}
          {errors.categoryIds && (
            <p role="alert" className="text-sm text-destructive">
              {errors.categoryIds.message}
            </p>
          )}
        </div>

        {options.brands.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="product-brand">{copy.brandLabel}</Label>
            <select
              id="product-brand"
              className={STAFF_FIELD_CLASS}
              value={brandIds[0] ?? 0}
              onChange={(event) => {
                const value = Number(event.target.value);
                setValue('brandIds', value > 0 ? [value] : [], { shouldDirty: true });
              }}
            >
              <option value={0}>{copy.noBrand}</option>
              {options.brands.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        )}

      </section>
    </>
  );
}
