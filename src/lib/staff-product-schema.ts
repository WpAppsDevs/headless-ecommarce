import { z } from 'zod';
import type { StaffProductPayload } from '@/lib/api/staff-products';

export interface StaffFormCopy {
  nameRequired: string;
  priceInvalid: string;
  sellAboveRegular: string;
  categoryRequired: string;
  imageRequired: string;
  galleryLimit: string;
  quantityInvalid: string;
}

/**
 * The product form's rules, shared by the client schema and its tests.
 *
 * They mirror the plugin's validator on purpose: the form should reject what
 * WordPress will reject, but the plugin stays the authority — a request built
 * by hand still meets the same checks there.
 */
export function buildStaffProductSchema(copy: StaffFormCopy) {
  return z
    .object({
      name: z.string().trim().min(2, copy.nameRequired).max(200, copy.nameRequired),
      description: z.string(),
      regularPrice: z.string(),
      sellPrice: z.string(),
      sku: z.string(),
      stockMode: z.enum(['managed', 'status']),
      stockQuantity: z.string(),
      backorders: z.enum(['no', 'notify', 'yes']),
      stockStatus: z.enum(['instock', 'outofstock']),
      categoryIds: z.array(z.number().int().positive()),
      brandIds: z.array(z.number().int().positive()).max(1),
      tagIds: z.array(z.number().int().positive()),
      availability: z.enum(['ready-stock', 'pre-order']),
      imageId: z.number().int(),
      galleryIds: z.array(z.number().int().positive()),
      status: z.enum(['draft', 'publish']),
    })
    .superRefine((values, ctx) => {
      const regular = parsePrice(values.regularPrice);
      const sell = parsePrice(values.sellPrice);

      // Zero is refused, not stored: a zero sell price becomes a 0.00 sale
      // price in WooCommerce and the product sells for nothing.
      if (regular === null || regular <= 0) {
        ctx.addIssue({ code: 'custom', path: ['regularPrice'], message: copy.priceInvalid });
      }

      if (sell === null || sell <= 0) {
        ctx.addIssue({ code: 'custom', path: ['sellPrice'], message: copy.priceInvalid });
      }

      if (regular !== null && sell !== null && sell > regular) {
        ctx.addIssue({ code: 'custom', path: ['sellPrice'], message: copy.sellAboveRegular });
      }

      if (values.categoryIds.length < 1) {
        ctx.addIssue({ code: 'custom', path: ['categoryIds'], message: copy.categoryRequired });
      }

      if (values.imageId <= 0) {
        ctx.addIssue({ code: 'custom', path: ['imageId'], message: copy.imageRequired });
      }

      if (values.galleryIds.length > 6) {
        ctx.addIssue({ code: 'custom', path: ['galleryIds'], message: copy.galleryLimit });
      }

      if (values.stockMode === 'managed') {
        const quantity = Number(values.stockQuantity);

        if (!Number.isInteger(quantity) || quantity < 0) {
          ctx.addIssue({ code: 'custom', path: ['stockQuantity'], message: copy.quantityInvalid });
        }
      }
    });
}

export type StaffProductFormValues = z.infer<ReturnType<typeof buildStaffProductSchema>>;

/** Parse a price field. Empty or malformed is null, which the schema rejects. */
export function parsePrice(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed === '' || !/^\d+(\.\d+)?$/.test(trimmed)) return null;

  return Number(trimmed);
}

/** Turn validated form values into the plugin's payload. */
export function toStaffProductPayload(values: StaffProductFormValues): StaffProductPayload {
  return {
    name: values.name.trim(),
    description: values.description,
    regular_price: values.regularPrice.trim(),
    sell_price: values.sellPrice.trim(),
    sku: values.sku.trim(),
    stock_mode: values.stockMode,
    stock_quantity: values.stockMode === 'managed' ? Number(values.stockQuantity) : 0,
    backorders: values.stockMode === 'managed' ? values.backorders : 'no',
    stock_status: values.stockStatus,
    category_ids: values.categoryIds,
    brand_ids: values.brandIds,
    tag_ids: values.tagIds,
    availability: values.availability,
    image_id: values.imageId,
    gallery_ids: values.galleryIds,
    status: values.status,
  };
}
