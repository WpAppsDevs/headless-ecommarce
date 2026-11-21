import { describe, expect, it } from 'vitest';
import {
  buildStaffProductSchema,
  parsePrice,
  toStaffProductPayload,
  type StaffProductFormValues,
} from '@/lib/staff-product-schema';

const copy = {
  nameRequired: 'name',
  priceInvalid: 'price',
  sellAboveRegular: 'sell',
  categoryRequired: 'category',
  imageRequired: 'image',
  galleryLimit: 'gallery',
  quantityInvalid: 'quantity',
};

const schema = buildStaffProductSchema(copy);

function values(overrides: Partial<StaffProductFormValues> = {}): StaffProductFormValues {
  return {
    name: 'Cotton shirt',
    description: '',
    regularPrice: '1200',
    sellPrice: '1000',
    sku: '',
    stockMode: 'managed',
    stockQuantity: '4',
    backorders: 'no',
    stockStatus: 'instock',
    categoryIds: [18],
    brandIds: [],
    tagIds: [],
    availability: 'ready-stock',
    imageId: 101,
    galleryIds: [],
    status: 'draft',
    ...overrides,
  };
}

function issuePaths(input: StaffProductFormValues): string[] {
  const result = schema.safeParse(input);

  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
}

describe('staff product schema', () => {
  it('accepts a complete product', () => {
    expect(schema.safeParse(values()).success).toBe(true);
  });

  it('rejects a sell price above the regular price', () => {
    expect(issuePaths(values({ sellPrice: '1300' }))).toContain('sellPrice');
  });

  it('accepts a sell price equal to the regular price', () => {
    expect(schema.safeParse(values({ sellPrice: '1200' })).success).toBe(true);
  });

  it('rejects a malformed price', () => {
    expect(issuePaths(values({ regularPrice: '12,00' }))).toContain('regularPrice');
  });

  it('requires a category', () => {
    expect(issuePaths(values({ categoryIds: [] }))).toContain('categoryIds');
  });

  it('requires a featured image', () => {
    expect(issuePaths(values({ imageId: 0 }))).toContain('imageId');
  });

  it('caps the gallery at six images', () => {
    expect(issuePaths(values({ galleryIds: [1, 2, 3, 4, 5, 6, 7] }))).toContain('galleryIds');
  });

  it('rejects a negative quantity in managed mode', () => {
    expect(issuePaths(values({ stockQuantity: '-1' }))).toContain('stockQuantity');
  });

  it('ignores the quantity when stock is not tracked', () => {
    expect(schema.safeParse(values({ stockMode: 'status', stockQuantity: '-1' })).success).toBe(true);
  });

  it('builds the payload the plugin expects', () => {
    const payload = toStaffProductPayload(values({ sku: ' SH-1 ', name: ' Cotton shirt ' }));

    expect(payload.name).toBe('Cotton shirt');
    expect(payload.sku).toBe('SH-1');
    expect(payload.regular_price).toBe('1200');
    expect(payload.sell_price).toBe('1000');
    expect(payload.stock_quantity).toBe(4);
    expect(payload.category_ids).toEqual([18]);
    expect(payload.image_id).toBe(101);
  });

  it('parses prices without accepting grouped digits', () => {
    expect(parsePrice('1200')).toBe(1200);
    expect(parsePrice('1200.50')).toBe(1200.5);
    expect(parsePrice('1,200')).toBeNull();
    expect(parsePrice('')).toBeNull();
  });
});
