import { describe, expect, it } from 'vitest';
import type { Product, ProductTag, ProductVariation } from '@/lib/api/products';
import { selectReadyStockPage } from '@/lib/ready-stock-page';

function tag(slug: string): ProductTag {
  return { id: 1, name: slug, slug };
}

function variation(id: number, stock_status: ProductVariation['stock_status']): ProductVariation {
  return {
    id,
    sku: `SKU-${id}`,
    price: '100',
    regular_price: '100',
    sale_price: '',
    on_sale: false,
    stock_status,
    stock_quantity: null,
    manage_stock: false,
    attributes: {},
    image: '',
  };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Test product',
    slug: 'test-product',
    type: 'simple',
    price: '100',
    regular_price: '100',
    sale_price: '',
    on_sale: false,
    stock_status: 'instock',
    stock_quantity: null,
    categories: [],
    images: [],
    attributes: [],
    variations: [],
    tags: [tag('ready-stock')],
    ...overrides,
  };
}

describe('ready stock collection page', () => {
  const soldOut = product({ id: 2, stock_status: 'outofstock' });
  const variableWithOne = product({
    id: 3,
    type: 'variable',
    stock_status: 'outofstock',
    variations: [variation(1, 'instock'), variation(2, 'outofstock')],
  });
  const variableWithIds = product({
    id: 4,
    type: 'variable',
    stock_status: 'instock',
    variations: [1, 2],
  });
  const preOrderWithoutStock = product({
    id: 5,
    stock_status: 'outofstock',
    tags: [tag('pre-order'), tag('ready-stock')],
  });

  it('paginates only purchasable ready-stock products', () => {
    const products = Array.from({ length: 10 }, (_, index) =>
      product({ id: index + 1, tags: [tag('ready-stock')] }),
    );

    const first = selectReadyStockPage(products, 1, 9);
    expect(first.items).toHaveLength(9);
    expect(first.meta).toEqual({ page: 1, per_page: 9, total: 10, total_pages: 2 });

    const second = selectReadyStockPage(products, 2, 9);
    expect(second.items).toHaveLength(1);
    expect(second.meta.total).toBe(10);
  });

  it('excludes sold-out products and keeps a variable product with one purchasable variation', () => {
    const result = selectReadyStockPage([product(), soldOut, variableWithOne], 1, 9);
    expect(result.items.map((entry) => entry.id)).toEqual([1, 3]);
    expect(result.meta.total).toBe(2);
  });

  it('keeps a list-shape variable product when the aggregate says in stock', () => {
    const result = selectReadyStockPage([variableWithIds], 1, 9);
    expect(result.items.map((entry) => entry.id)).toEqual([4]);
  });

  it('excludes an out-of-stock pre-order product tagged ready stock', () => {
    const result = selectReadyStockPage([preOrderWithoutStock], 1, 9);
    expect(result.items).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  it('clamps an out-of-range page to the last page', () => {
    const products = Array.from({ length: 10 }, (_, index) =>
      product({ id: index + 1, tags: [tag('ready-stock')] }),
    );

    const result = selectReadyStockPage(products, 99, 9);
    expect(result.meta.page).toBe(2);
    expect(result.items).toHaveLength(1);
  });
});
