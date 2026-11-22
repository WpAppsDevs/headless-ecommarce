import { describe, expect, it } from 'vitest';
import { normalizeStaffProductPage } from '@/lib/api/staff-products';

const product = {
  id: 32,
  name: 'Hat',
  status: 'publish',
  regular_price: '12',
  price: '12',
  stock_status: 'instock',
};

describe('normalizeStaffProductPage', () => {
  it('reads the pagination meta that sits beside data', () => {
    // The shape the plugin returns today: data is the items array and the
    // counts live in `meta`. Reading `data.items` saw nothing here, which is
    // how a shop with products showed "No products yet".
    const page = normalizeStaffProductPage({
      success: true,
      data: [product],
      meta: { page: 2, per_page: 20, total: 41, total_pages: 3 },
    });

    expect(page.items).toHaveLength(1);
    expect(page.items[0].name).toBe('Hat');
    expect(page).toMatchObject({ page: 2, perPage: 20, total: 41, totalPages: 3 });
  });

  it('still reads the older nested shape', () => {
    const page = normalizeStaffProductPage({
      success: true,
      data: { items: [product], page: 1, per_page: 5, total: 1, total_pages: 1 },
    });

    expect(page.items).toHaveLength(1);
    expect(page).toMatchObject({ perPage: 5, total: 1, totalPages: 1 });
  });

  it('treats an empty collection as empty, not as a crash', () => {
    expect(normalizeStaffProductPage({ success: true, data: [], meta: { total: 0 } })).toMatchObject(
      { items: [], total: 0, page: 1, perPage: 20, totalPages: 0 },
    );
    expect(normalizeStaffProductPage(null)).toMatchObject({ items: [], total: 0 });
  });
});
